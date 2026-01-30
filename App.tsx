import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import {
  Language,
  TranslationItem,
  ConnectionStatus,
  VoiceOption,
  UserProfile,
  VoiceName
} from './types';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_SOURCE_LANG,
  DEFAULT_TARGET_LANG,
  DEFAULT_VOICE,
  VOICE_OPTIONS,
  GEMINI_MODEL,
  FREE_LIMIT_SECONDS,
  PREMIUM_CHECKOUT_URL
} from './constants';
import {
  decodeBase64,
  decodeAudioData,
  createPcmBlob
} from './utils/audioHelpers';
import LanguageSelector from './components/LanguageSelector';
import AudioVisualizer from './components/AudioVisualizer';
import Paywall from './components/Paywall';
import UpsellPage from './components/UpsellPage';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('talklingo_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
      }
    }
    return {
      isPremium: false,
      usage: { secondsUsed: 0, lastResetDate: new Date().toDateString() }
    };
  });

  const [sourceLang, setSourceLang] = useState<Language>(DEFAULT_SOURCE_LANG);
  const [targetLang, setTargetLang] = useState<Language>(DEFAULT_TARGET_LANG);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(DEFAULT_VOICE);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [history, setHistory] = useState<TranslationItem[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState<{ input: string, output: string }>({ input: '', output: '' });
  const [paywall, setPaywall] = useState<{ open: boolean; reason?: string }>({ open: false });
  const [isAiTalking, setIsAiTalking] = useState(false);
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const micStreamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Status Ref para evitar closure bugs em callbacks de longa duração
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const inputTranscriptionBuffer = useRef('');
  const outputTranscriptionBuffer = useRef('');

  // Silence threshold and timeout
  const SILENCE_THRESHOLD = 0.002; // Reduzido de 0.01 para ser mais sensível
  const SILENCE_TIMEOUT_MS = 1500;
  const silenceTimerRef = useRef<number | null>(null);
  const isAudioActiveRef = useRef(true);

  const isLocked = !profile.isPremium && profile.usage.secondsUsed >= FREE_LIMIT_SECONDS;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
      const updatedProfile = { ...profile, isPremium: true };
      setProfile(updatedProfile);
      localStorage.setItem('talklingo_profile', JSON.stringify(updatedProfile));
      window.history.replaceState({}, document.title, window.location.pathname);
      setShowUpsell(false);
      setTimeout(() => {
        alert("🎉 ACESSO PREMIUM ATIVADO!");
      }, 500);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('talklingo_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (history.length > 0) {
      historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  useEffect(() => {
    let interval: number | null = null;
    if (status === ConnectionStatus.CONNECTED) {
      interval = window.setInterval(() => {
        setProfile(prev => {
          if (prev.isPremium) return prev;
          const nextSeconds = prev.usage.secondsUsed + 1;
          if (nextSeconds >= FREE_LIMIT_SECONDS) {
            stopTranslation();
            setPaywall({ open: true, reason: "Seu tempo de teste expirou." });
            return { ...prev, usage: { ...prev.usage, secondsUsed: FREE_LIMIT_SECONDS } };
          }
          return { ...prev, usage: { ...prev.usage, secondsUsed: nextSeconds } };
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [status]);

  const stopAllAudio = useCallback(() => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) { }
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsAiTalking(false);
  }, []);

  const stopTranslation = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close().catch(() => { });
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close().catch(() => { });
      outputAudioContextRef.current = null;
    }
    sessionPromiseRef.current?.then(session => session.close()).catch(() => { });
    sessionPromiseRef.current = null;
    setStatus(prev => prev === ConnectionStatus.PERMISSION_DENIED ? prev : ConnectionStatus.DISCONNECTED);
    setCurrentTranscription({ input: '', output: '' });
    inputTranscriptionBuffer.current = '';
    outputTranscriptionBuffer.current = '';
    stopAllAudio();
  }, [stopAllAudio]);

  const startTranslation = async (forcedVoice?: VoiceOption) => {
    console.log("Botão de tradução clicado!");
    const voiceToUse = forcedVoice || selectedVoice;
    if (isLocked) {
      setPaywall({ open: true });
      return;
    }
    if (status === ConnectionStatus.CONNECTING || status === ConnectionStatus.CONNECTED) {
      if (forcedVoice) stopTranslation();
      else return;
    }

    setStatus(ConnectionStatus.CONNECTING);
    stopAllAudio();


    try {
      console.log("Solicitando permissão de microfone...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
        alert("API Key não encontrada! Verifique o arquivo .env.local.");
        throw new Error("API Key não configurada.");
      }

      console.log("Inicializando GoogleGenAI (v1beta)...");
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        apiVersion: 'v1beta'
      });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      await Promise.all([inputCtx.resume(), outputCtx.resume()]);
      micStreamRef.current = stream;

      // REFINAMENTO DO INTÉRPRETE: Instruindo a IA a ser a ponte entre duas pessoas
      const systemInstruction = `
        ROLE: Specialized Bi-directional Simultaneous Interpreter.
        CONTEXT: You are facilitating a live conversation between a speaker of ${sourceLang.name} and a speaker of ${targetLang.name}.
        CORE DIRECTIVE: 
        1. When you hear ${sourceLang.name}, translate it immediately and accurately into ${targetLang.name} audio output.
        2. When you hear ${targetLang.name}, translate it immediately and accurately into ${sourceLang.name} audio output.
        3. ACT AS THE VOICE of the person speaking. Use a natural, native-sounding tone for the target language.
        4. ABSOLUTELY NO metadata, greetings from the AI, or conversational fillers. Only the translation.
        5. Start output as soon as context is clear to minimize latency.
        VOICE GENDER: ${voiceToUse.gender}.
      `.trim();

      const sessionPromise = ai.live.connect({
        model: GEMINI_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceToUse.id } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log("Handshake WebSocket concluído! Conexão ativa.");
            setStatus(ConnectionStatus.CONNECTED);
            const source = inputCtx.createMediaStreamSource(stream);
            const gainNode = inputCtx.createGain();
            gainNode.gain.value = 1.1;

            const scriptProcessor = inputCtx.createScriptProcessor(2048, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              // Verificamos via Ref para garantir o valor mais atual
              if (statusRef.current !== ConnectionStatus.CONNECTED) return;
              const inputData = e.inputBuffer.getChannelData(0);

              // Volume-based silence detection
              let maxVal = 0;
              for (let i = 0; i < inputData.length; i++) {
                if (Math.abs(inputData[i]) > maxVal) maxVal = Math.abs(inputData[i]);
              }

              if (maxVal < SILENCE_THRESHOLD) {
                if (isAudioActiveRef.current && !silenceTimerRef.current) {
                  silenceTimerRef.current = window.setTimeout(() => {
                    console.log(`Silêncio detectado (Volume: ${maxVal.toFixed(5)}) - Suspendendo áudio.`);
                    isAudioActiveRef.current = false;
                    silenceTimerRef.current = null;
                  }, SILENCE_TIMEOUT_MS);
                }
              } else {
                if (silenceTimerRef.current) {
                  clearTimeout(silenceTimerRef.current);
                  silenceTimerRef.current = null;
                }
                if (!isAudioActiveRef.current) {
                  console.log(`Voz detectada (Volume: ${maxVal.toFixed(5)}) - Retomando envio.`);
                  isAudioActiveRef.current = true;
                }
              }

              if (!isAudioActiveRef.current) {
                // Log de volume baixo silencioso (opcional para debug)
                if (Math.random() < 0.005) console.log("Áudio suspenso: volume muito baixo", maxVal.toFixed(5));
                return;
              }

              const pcmBlob = createPcmBlob(inputData);

              // Log ocasional para verificar se estamos capturando áudio
              if (Math.random() < 0.01) {
                console.log("Enviando áudio PCM...", pcmBlob.data.substring(0, 20) + "...");
              }

              sessionPromise.then(session => {
                if (session && statusRef.current === ConnectionStatus.CONNECTED) {
                  session.sendRealtimeInput({ media: pcmBlob });
                }
              }).catch(() => { });
            };
            source.connect(gainNode);
            gainNode.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            console.log("Mensagem da IA recebida:", message);
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'sync_voice_gender') {
                  const gender = (fc.args as any).gender;
                  const newVoice = VOICE_OPTIONS.find(v => v.gender === gender);
                  if (newVoice && newVoice.id !== voiceToUse.id) {
                    setSelectedVoice(newVoice);
                    stopTranslation();
                    setTimeout(() => startTranslation(newVoice), 300);
                  }
                }
              }
            }

            if (message.serverContent?.inputTranscription) {
              inputTranscriptionBuffer.current += message.serverContent.inputTranscription.text;
              setCurrentTranscription(prev => ({ ...prev, input: inputTranscriptionBuffer.current }));
            }
            if (message.serverContent?.outputTranscription) {
              outputTranscriptionBuffer.current += message.serverContent.outputTranscription.text;
              setCurrentTranscription(prev => ({ ...prev, output: outputTranscriptionBuffer.current }));
            }

            if (message.serverContent?.turnComplete) {
              if (inputTranscriptionBuffer.current && outputTranscriptionBuffer.current) {
                const newItem: TranslationItem = {
                  id: Date.now().toString(),
                  originalText: inputTranscriptionBuffer.current,
                  translatedText: outputTranscriptionBuffer.current,
                  sourceLang: sourceLang.code,
                  targetLang: targetLang.code,
                  detectedLang: sourceLang.code,
                  timestamp: new Date(),
                };
                setHistory(prev => [...prev, newItem].slice(-50));
              }
              inputTranscriptionBuffer.current = '';
              outputTranscriptionBuffer.current = '';
              setCurrentTranscription({ input: '', output: '' });
            }

            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputCtx) {
              setIsAiTalking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decodeBase64(audioData), outputCtx, 24000, 1);
              const sourceNode = outputCtx.createBufferSource();
              sourceNode.buffer = buffer;
              sourceNode.connect(outputCtx.destination);
              sourceNode.onended = () => {
                sourcesRef.current.delete(sourceNode);
                if (sourcesRef.current.size === 0) setIsAiTalking(false);
              };
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(sourceNode);
            }

            if (message.serverContent?.interrupted) {
              stopAllAudio();
            }
          },
          onerror: (err) => {
            console.error("Session Error:", err);
            setStatus(ConnectionStatus.ERROR);
            stopTranslation();
          },
          onclose: (event) => {
            console.log("Conexão WebSocket encerrada. Código:", event?.code, "Razão:", event?.reason);
            setStatus(ConnectionStatus.DISCONNECTED);
            stopTranslation();
          }
        }
      }).catch(err => {
        console.error("FALHA AO INICIAR SESSÃO LIVE:", err);
        setStatus(ConnectionStatus.ERROR);
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (error: any) {
      stopTranslation();
      setStatus(error.message === "MIC_PERMISSION_DENIED" ? ConnectionStatus.PERMISSION_DENIED : ConnectionStatus.ERROR);
    }
  };

  const toggleTranslation = () => {
    if (status === ConnectionStatus.CONNECTED || status === ConnectionStatus.CONNECTING) {
      stopTranslation();
    } else {
      startTranslation();
    }
  };

  const handleVoiceChange = (v: VoiceOption) => {
    if (isLocked) { setPaywall({ open: true }); return; }
    setSelectedVoice(v);
    if (status === ConnectionStatus.CONNECTED) {
      stopTranslation();
      setTimeout(() => startTranslation(v), 300);
    }
  };

  const handleGoPremium = () => {
    if (profile.isPremium) return;
    setShowUpsell(true);
  };

  if (showUpsell) return <UpsellPage onBack={() => setShowUpsell(false)} />;

  const progressPercent = Math.min(100, (profile.usage.secondsUsed / FREE_LIMIT_SECONDS) * 100);

  return (
    <div className="min-h-screen bg-[#010816] text-slate-100 flex flex-col">
      <Paywall
        isOpen={paywall.open}
        onClose={() => setPaywall({ open: false })}
        reason={paywall.reason}
        onViewOffer={handleGoPremium}
      />

      <header className="sticky top-0 z-50 bg-[#010816]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center">
          <img
            src="logo.png"
            alt="TalkLingo AI"
            className="h-9 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback') as HTMLElement;
              if (fallback) fallback.classList.remove('hidden');
              if (fallback) fallback.classList.add('flex');
            }}
          />
          <div className="logo-fallback hidden items-center gap-1 font-extrabold text-xl tracking-tight">
            <span className="text-blue-500">Talk</span>
            <span className="text-orange-500">Lingo</span>
            <span className="text-white ml-1 text-sm bg-blue-600/20 px-1.5 py-0.5 rounded border border-blue-500/30">AI</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleGoPremium}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all duration-300 ${profile.isPremium ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 cursor-default' : 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 text-white shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
            {profile.isPremium ? 'Premium' : 'Go Premium'}
          </button>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <div className={`w-2 h-2 rounded-full ${status === ConnectionStatus.CONNECTED ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' :
              status === ConnectionStatus.CONNECTING ? 'bg-yellow-500 animate-pulse' :
                status === ConnectionStatus.PERMISSION_DENIED || isLocked ? 'bg-red-500' : 'bg-slate-700'
              }`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">
              {status === ConnectionStatus.PERMISSION_DENIED ? 'MIC DENIED' : isLocked ? 'LIMIT' : status}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        {status === ConnectionStatus.PERMISSION_DENIED && (
          <div className="bg-red-600/10 border border-red-500/30 p-6 rounded-3xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-600/20 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 20-8-8 8-8" /><path d="M7 12h13" /></svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-red-100 uppercase tracking-widest mb-1">Permissão de Microfone Necessária</h3>
                <p className="text-xs text-red-200/70 font-medium mb-4 leading-relaxed">
                  O TalkLingo precisa do microfone para traduzir sua voz. Se o prompt de permissão não apareceu, clique no ícone de cadeado (🔒) na barra de endereços do navegador e habilite o microfone.
                </p>
                <button
                  onClick={() => setStatus(ConnectionStatus.DISCONNECTED)}
                  className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {!profile.isPremium && (
          <div className={`bg-white/5 p-4 rounded-3xl border backdrop-blur-md transition-colors ${isLocked ? 'border-red-500/30 bg-red-500/5' : 'border-white/10'}`}>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isLocked ? 'text-red-500' : 'text-slate-500'}`}>
                {isLocked ? 'TESTE EXPIRADO' : 'Limite de Uso'}
              </span>
              <span className={`text-[11px] font-black uppercase tracking-wider ${isLocked ? 'text-red-500' : 'text-blue-500'}`}>
                {Math.floor(profile.usage.secondsUsed / 60)}:{(profile.usage.secondsUsed % 60).toString().padStart(2, '0')} / 1:00
              </span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-1000 ${isLocked ? 'bg-red-600' : progressPercent > 80 ? 'bg-orange-500' : 'bg-blue-600'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {isLocked && (
              <p className="text-[10px] text-red-400 font-bold mt-3 text-center uppercase tracking-widest animate-pulse">
                Assine para continuar usando
              </p>
            )}
          </div>
        )}

        <div className={(isLocked || status === ConnectionStatus.PERMISSION_DENIED) ? "opacity-50 pointer-events-none" : ""}>
          <LanguageSelector
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={(l) => { setSourceLang(l); if (status === ConnectionStatus.CONNECTED) stopTranslation(); }}
            onTargetChange={(l) => { setTargetLang(l); if (status === ConnectionStatus.CONNECTED) stopTranslation(); }}
            onSwap={() => { const old = sourceLang; setSourceLang(targetLang); setTargetLang(old); if (status === ConnectionStatus.CONNECTED) stopTranslation(); }}
          />
        </div>

        <div className={`bg-slate-900/40 p-5 rounded-3xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 ${(isLocked || status === ConnectionStatus.PERMISSION_DENIED) ? 'opacity-50' : ''}`}>
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center sm:text-left">IA Voice Gender</h4>
            <div className="flex gap-2 justify-center sm:justify-start">
              {VOICE_OPTIONS.map(v => (
                <button
                  key={v.id}
                  onClick={() => handleVoiceChange(v)}
                  disabled={isLocked || status === ConnectionStatus.PERMISSION_DENIED}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedVoice.id === v.id ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-950 border-white/10 text-slate-400'}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => !isLocked && status !== ConnectionStatus.PERMISSION_DENIED && setIsAutoSync(!isAutoSync)}
            disabled={isLocked || status === ConnectionStatus.PERMISSION_DENIED}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border transition-all ${isAutoSync ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-slate-950 border-white/10 text-slate-600'}`}
          >
            <div className={`w-2 h-2 rounded-full ${isAutoSync ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">Smart Voice Sync</span>
          </button>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 shadow-inner flex flex-col gap-6 relative overflow-hidden">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 ${(isLocked || status === ConnectionStatus.PERMISSION_DENIED) ? 'blur-sm grayscale opacity-30' : ''}`}>
            <div className={`transition-all duration-500 flex flex-col gap-2`}>
              <div className="flex items-center gap-2 px-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{sourceLang.name}</h3>
              </div>
              <div className="bg-black/40 p-5 rounded-3xl border border-white/5 min-h-[120px] text-lg font-medium text-slate-200 leading-relaxed italic">
                {currentTranscription.input || (status === ConnectionStatus.CONNECTED ? "Ouvindo..." : "Aguardando voz...")}
              </div>
            </div>

            <div className={`transition-all duration-500 flex flex-col gap-2`}>
              <div className="flex items-center gap-2 px-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{targetLang.name}</h3>
              </div>
              <div className="bg-orange-600/10 p-5 rounded-3xl border border-orange-500/20 min-h-[120px] text-lg font-bold text-orange-100 leading-relaxed">
                {currentTranscription.output || "..."}
              </div>
            </div>
          </div>

          {(isLocked || status === ConnectionStatus.PERMISSION_DENIED) && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
              <div className="bg-slate-900 border border-red-500/50 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">{status === ConnectionStatus.PERMISSION_DENIED ? 'MIC ERRO' : 'Bloqueado'}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{status === ConnectionStatus.PERMISSION_DENIED ? 'Acesso negado' : 'Assine para liberar'}</p>
                </div>
              </div>
            </div>
          )}

          {!(isLocked || status === ConnectionStatus.PERMISSION_DENIED) && (
            <div className="h-20 w-full">
              <AudioVisualizer
                isActive={status === ConnectionStatus.CONNECTED}
                stream={micStreamRef.current}
                mode={isAiTalking ? 'ai' : 'user'}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 py-4">
          <button
            onClick={toggleTranslation}
            disabled={status === ConnectionStatus.CONNECTING}
            className={`
              relative group w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 active:scale-90
              ${isLocked || status === ConnectionStatus.PERMISSION_DENIED
                ? 'bg-slate-800 border-2 border-red-500/50 cursor-not-allowed shadow-none grayscale'
                : status === ConnectionStatus.CONNECTED
                  ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_40px_rgba(220,38,38,0.3)]'
                  : status === ConnectionStatus.CONNECTING
                    ? 'bg-yellow-600 shadow-[0_0_40px_rgba(202,138,4,0.3)]'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.3)]'}
            `}
          >
            {isLocked || status === ConnectionStatus.PERMISSION_DENIED ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            ) : status === ConnectionStatus.CONNECTED ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            ) : status === ConnectionStatus.CONNECTING ? (
              <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
            )}

            {status === ConnectionStatus.CONNECTED && !isLocked && (
              <div className="absolute inset-[-12px] rounded-full border-2 border-red-500/30 animate-[ping_2s_linear_infinite]" />
            )}
          </button>
          <p className={`text-[11px] font-black uppercase tracking-[0.4em] ${isLocked || status === ConnectionStatus.PERMISSION_DENIED ? 'text-red-500' : 'text-slate-500 animate-pulse'}`}>
            {status === ConnectionStatus.PERMISSION_DENIED ? "ACESSO NEGADO" : isLocked ? "LIMITE ATINGIDO" : status === ConnectionStatus.CONNECTED ? "TRADUÇÃO AO VIVO" : status === ConnectionStatus.CONNECTING ? "CONECTANDO..." : "TOQUE PARA INICIAR"}
          </p>
        </div>

        <div className={`mt-8 flex flex-col gap-6 ${(isLocked || status === ConnectionStatus.PERMISSION_DENIED) ? 'opacity-30 blur-[1px]' : ''}`}>
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Histórico Recente</h2>
            <button
              onClick={() => !isLocked && status !== ConnectionStatus.PERMISSION_DENIED && setHistory([])}
              disabled={isLocked || status === ConnectionStatus.PERMISSION_DENIED}
              className="text-[10px] font-bold text-slate-600 hover:text-red-400 transition-colors uppercase tracking-widest"
            >
              Limpar
            </button>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-hide">
            {history.length === 0 ? (
              <div className="bg-white/5 rounded-3xl border border-white/5 p-12 text-center">
                <p className="text-slate-600 font-bold text-[11px] uppercase tracking-widest">Nenhuma conversa ainda</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-start max-w-[85%]">
                    <div className="bg-slate-900 border border-white/5 p-4 rounded-3xl rounded-tl-none shadow-lg">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-2">{item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • VOCÊ</p>
                      <p className="text-slate-300 text-sm italic leading-relaxed">{item.originalText}</p>
                    </div>
                  </div>
                  <div className="flex justify-end max-w-[85%] ml-auto">
                    <div className="bg-orange-600 p-4 rounded-3xl rounded-tr-none shadow-xl shadow-orange-900/20">
                      <p className="text-[10px] font-black text-orange-200 uppercase tracking-wider mb-2 text-right">LINGO AI</p>
                      <p className="text-white text-base font-bold leading-relaxed">{item.translatedText}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={historyEndRef} />
          </div>
        </div>
      </main>

      <footer className="mt-auto px-6 py-8 border-t border-white/5 bg-black/20">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
          <div className="flex gap-6">
            <span className="hover:text-blue-500 cursor-pointer transition-colors">Privacidade</span>
            <span className="hover:text-blue-500 cursor-pointer transition-colors">Termos</span>
            <span className="hover:text-blue-500 cursor-pointer transition-colors">Suporte</span>
          </div>
          <p>© 2025 TalkLingo AI • Intelligent Language Bridge</p>
        </div>
      </footer>
    </div>
  );
};

export default App;