import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  PREMIUM_CHECKOUT_URL,
  WHATSAPP_LINK
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
import PricingPage from './components/PricingPage';
import SocialProof from './components/SocialProof';
import CallArea from './components/CallArea';
import LegalPage from './components/LegalPage';
import SupportPage from './components/SupportPage';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('chatolingo_profile');
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

  const [sourceLang, setSourceLang] = useState<Language>(() => {
    // Inicializa com "Detect Language" por padrão conforme o novo design
    return { code: 'auto', name: 'Detect language', flag: '🔍' };
  });
  const [targetLang, setTargetLang] = useState<Language>(DEFAULT_TARGET_LANG);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(DEFAULT_VOICE);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [history, setHistory] = useState<TranslationItem[]>(() => {
    const saved = localStorage.getItem('chatolingo_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      } catch (e) {
        console.error("Erro ao carregar histórico:", e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('chatolingo_history', JSON.stringify(history));
  }, [history]);
  const [currentTranscription, setCurrentTranscription] = useState<{ input: string, output: string }>({ input: '', output: '' });
  const [paywall, setPaywall] = useState<{ open: boolean; reason?: string }>({ open: false });
  const [isAiTalking, setIsAiTalking] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showCallArea, setShowCallArea] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('chatolingo_onboarding_done') !== 'true';
  });
  const [isIncognito, setIsIncognito] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  useEffect(() => {
    let interval: number | null = null;
    if (status === ConnectionStatus.CONNECTED) {
      interval = window.setInterval(() => {
        setSessionSeconds(prev => (prev < FREE_LIMIT_SECONDS ? prev + 1 : prev));
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
      setSessionSeconds(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [status]);

  useEffect(() => {
    // Detect Incognito/Anonymous mode
    const detectIncognito = () => {
      const fs = (window as any).RequestFileSystem || (window as any).webkitRequestFileSystem;
      if (!fs) {
        // Fallback for some browsers: check storage estimate
        if (navigator.storage && navigator.storage.estimate) {
          navigator.storage.estimate().then(estimate => {
            if (estimate.quota && estimate.quota < 120000000) {
              setIsIncognito(true);
            }
          });
        }
        return;
      }
      fs((window as any).TEMPORARY, 100, () => setIsIncognito(false), () => setIsIncognito(true));
    };
    detectIncognito();
  }, []);

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
  const SILENCE_THRESHOLD = 0.015; // Aumentado significativamente para ignorar ruído ambiente. Exige fala próxima.
  const SILENCE_TIMEOUT_MS = 1500; // Tempo reduzido para cortar o canal mais rápido após a fala.
  const silenceTimerRef = useRef<number | null>(null);
  const isAudioActiveRef = useRef(true);

  const totalLimit = FREE_LIMIT_SECONDS;
  const isLocked = !profile.isPremium && profile.usage.secondsUsed >= totalLimit;

  const handleShareReward = () => {
    const text = "Olha esse tradutor de voz com IA que incrível! Traduz em tempo real: https://chatolingoai.vercel.app/";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Token Secreto para ativação: Mais seguro que apenas payment_success=true
    const activationToken = "TLPRO_99xY_2026_ACTIVE";

    if (params.get('access_token') === activationToken || params.get('payment_success') === 'true') {
      const updatedProfile = { ...profile, isPremium: true };
      setProfile(updatedProfile);
      localStorage.setItem('chatolingo_profile', JSON.stringify(updatedProfile));

      // Limpa a URL imediatamente para evitar compartilhamento do link de ativação
      window.history.replaceState({}, document.title, window.location.pathname);

      setShowUpsell(false);
      setTimeout(() => {
        alert("🎉 ACESSO PREMIUM ATIVADO!");
      }, 500);
    }
  }, []);


  useEffect(() => {
    localStorage.setItem('chatolingo_profile', JSON.stringify(profile));
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
    // Haptic: Suave
    if ('vibrate' in navigator) navigator.vibrate(10);
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
      setPaywall({ open: true, reason: "Seu limite diário gratuito terminou." });
      return;
    }
    if (isIncognito) {
      alert("⚠️ O modo anônimo não é suportado para garantir a segurança e persistência da sua conta. Por favor, use uma aba normal.");
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
          channelCount: 1
        }
      });

      // Haptic: Confirmação de início
      if ('vibrate' in navigator) navigator.vibrate([20, 10, 20]);

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

      console.log(`Audio Contexts Initialized. Input Rate: ${inputCtx.sampleRate}, Output Rate: ${outputCtx.sampleRate}`);

      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      await Promise.all([inputCtx.resume(), outputCtx.resume()]);
      micStreamRef.current = stream;

      // REFINAMENTO DO INTÉRPRETE: Instruindo a IA a ser a ponte entre duas pessoas
      const systemInstruction = `
        ROLE: Specialized Bi-directional Simultaneous Interpreter & VOCAL CLONE MIRROR.
        CONTEXT: You are facilitating a live conversation between two distinct individuals. 
        CORE DIRECTIVE - THE VOICE MIRROR PROTOCOL:
        1. FOR EVERY TURN: Analyze the speaker's biometric vocal profile (Gender, Pitch, Age, Emotional Intensity).
        2. TRANSLATION AS A CLONE: You MUST translate the speech but RETAIN the speaker's vocal characteristics. 
           - If a MALE speaks -> Output must be MALE.
           - If a FEMALE speaks -> Output must be FEMALE.
           - If a CHILD speaks -> Output must be HIGHER PITCHED.
           - Mirror excitement, anger, hesitation, and sincerity with 100% fidelity.
        3. AUTO-DETECTION: ${sourceLang.code === 'auto' ? 'Detect the source language automatically' : `The source language is ${sourceLang.name}`}. The target language is ${targetLang.name}.
        4. SPEED & ACCURACY: Translate immediately. Use native-level idioms, local slang, and appropriate formal/informal registers.
        5. ZERO AI IDENTITY: Do not mention you are an AI. Do not use fillers. Only the translated speech.
        6. ACT AS THE PERSON: You are not just translating words; you are translating the PERSON'S VOICE.
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

            // Noise Reduction: Filtro passa-alta para remover ruídos graves (ar-condicionado, ventoinhas)
            const filter = inputCtx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 200; // Corta frequências abaixo de 200Hz

            const gainNode = inputCtx.createGain();
            gainNode.gain.value = 1.1; // Reduzido para evitar amplificar ruídos distantes

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
            source.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            console.log("Mensagem da IA recebida:", message);


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
      console.error("Erro ao iniciar tradução:", error);
      stopTranslation();
      const isPermissionDenied =
        error.message === "MIC_PERMISSION_DENIED" ||
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError";

      setStatus(isPermissionDenied ? ConnectionStatus.PERMISSION_DENIED : ConnectionStatus.ERROR);
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

    // Tracking: Iniciou processo de compra
    try {
      (window as any).fbq?.('track', 'InitiateCheckout');
      (window as any).gtag?.('event', 'begin_checkout');
    } catch (e) { }

    setShowUpsell(true);
  };

  const handleViewPlans = () => {
    setShowPricing(true);
  };

  if (showUpsell) return <UpsellPage onBack={() => setShowUpsell(false)} />;
  if (showPricing) return <PricingPage onBack={() => setShowPricing(false)} />;
  if (showPrivacy) return <LegalPage type="privacy" onBack={() => setShowPrivacy(false)} />;
  if (showTerms) return <LegalPage type="terms" onBack={() => setShowTerms(false)} />;
  if (showSupport) return <SupportPage onBack={() => setShowSupport(false)} />;
  if (showCallArea) return <CallArea profile={profile} onBack={() => setShowCallArea(false)} onShowPricing={() => setShowPricing(true)} />;

  const progressPercent = Math.min(100, (profile.usage.secondsUsed / totalLimit) * 100);

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
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="flex items-center font-black text-2xl tracking-tighter">
              <span className="text-blue-500">Chat</span>
              <span className="text-orange-500">OLingo</span>
              <div className="ml-2 border-2 border-blue-500/30 rounded-lg px-2 py-0.5 flex items-center justify-center bg-blue-600/10 h-6">
                <span className="text-white text-[10px] font-black uppercase">AI</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!profile.isPremium && (
            <button
              onClick={handleViewPlans}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10 hover:bg-white/5 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              Ver Planos
            </button>
          )}
          <button
            onClick={handleGoPremium}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all duration-300 ${profile.isPremium ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 cursor-default' : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 border-amber-400/50 text-white shadow-xl shadow-amber-600/20 hover:scale-105 active:scale-95'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
            Premium
          </button>

          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <div className={`w-2 h-2 rounded-full ${status === ConnectionStatus.CONNECTED ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' :
              status === ConnectionStatus.CONNECTING ? 'bg-yellow-500 animate-pulse' :
                status === ConnectionStatus.PERMISSION_DENIED || isLocked ? 'bg-red-500' : 'bg-slate-700'
              }`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {status === ConnectionStatus.CONNECTED ?
                `${Math.floor(sessionSeconds / 60).toString().padStart(2, '0')}:${(sessionSeconds % 60).toString().padStart(2, '0')} / 10:00` :
                (status === ConnectionStatus.PERMISSION_DENIED ? 'MIC DENIED' : isLocked ? 'LIMIT' : status)
              }
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth scrollbar-hide flex flex-col gap-10">
          {history.length === 0 && !currentTranscription.input && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-10">
              <div className="w-24 h-24 mb-6 rounded-full border-4 border-slate-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
              </div>
              <p className="text-sm font-black uppercase tracking-[0.5em]">ChatOLingo AI</p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-4">Intérprete Simultâneo de Bolso</p>
            </div>
          )}

          {/* Histórico e Transcrições Atuais */}
          {[...history, ...(currentTranscription.input || currentTranscription.output ? [{
            id: 'current',
            originalText: currentTranscription.input,
            translatedText: currentTranscription.output,
            timestamp: new Date(),
            sourceLang: sourceLang.code,
            targetLang: targetLang.code
          }] : [])].map((item, idx) => (
            <div key={item.id + idx} className="flex flex-col gap-4 animate-in slide-in-from-bottom-6 duration-700">
              {/* Balão do Usuário (Esquerda) */}
              {item.originalText && (
                <div className="flex justify-start max-w-[85%]">
                  <div className="bg-slate-900/80 border border-white/5 p-4 rounded-3xl rounded-tl-none shadow-xl backdrop-blur-sm">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Você • {idx < history.length ? sourceLang.name : 'Voz'}</p>
                    <p className="text-lg md:text-xl font-medium text-slate-300 leading-relaxed italic">
                      "{item.originalText}"
                    </p>
                  </div>
                </div>
              )}

              {/* Balão da Tradução (Direita) */}
              {item.translatedText && (
                <div className="flex justify-end max-w-[85%] ml-auto">
                  <div className="bg-blue-600 p-4 rounded-3xl rounded-tr-none shadow-2xl shadow-blue-900/20">
                    <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-2 text-right">{targetLang.name} • Tradução</p>
                    <p className="text-lg md:text-2xl font-bold text-white leading-tight">
                      {item.translatedText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={historyEndRef} />
        </div>

        {/* Visualizador Flutuante */}
        {status === ConnectionStatus.CONNECTED && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs px-6 z-10">
            <AudioVisualizer
              isActive={status === ConnectionStatus.CONNECTED}
              stream={micStreamRef.current}
              mode={isAiTalking ? 'ai' : 'user'}
            />
          </div>
        )}
      </main>

      {/* CONTROLES FIXOS NO RODAPÉ */}
      <div className="bg-[#010816] border-t border-white/5 px-6 pt-6 pb-10 space-y-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className={(isLocked || status === ConnectionStatus.PERMISSION_DENIED) ? "opacity-30 pointer-events-none" : ""}>
          <LanguageSelector
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={(l) => { setSourceLang(l); if (status === ConnectionStatus.CONNECTED) stopTranslation(); }}
            onTargetChange={(l) => { setTargetLang(l); if (status === ConnectionStatus.CONNECTED) stopTranslation(); }}
            onSwap={() => { const old = sourceLang; setSourceLang(targetLang); setTargetLang(old); if (status === ConnectionStatus.CONNECTED) stopTranslation(); }}
          />
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Smart Gender Sync Active</span>
          </div>

          <button
            onClick={toggleTranslation}
            disabled={status === ConnectionStatus.CONNECTING || isIncognito}
            className={`
                relative h-20 w-full max-w-md rounded-[2rem] flex items-center justify-center transition-all duration-500 active:scale-95
                ${isLocked || status === ConnectionStatus.PERMISSION_DENIED || isIncognito
                ? 'bg-slate-800 cursor-not-allowed grayscale'
                : status === ConnectionStatus.CONNECTED
                  ? 'bg-white shadow-[0_0_50px_rgba(255,255,255,0.2)]'
                  : status === ConnectionStatus.CONNECTING
                    ? 'bg-yellow-600'
                    : 'bg-white shadow-[0_0_30px_rgba(255,255,255,0.1)]'}
              `}
          >
            <div className="flex items-center gap-4">
              {isIncognito ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                  <span className="text-red-500 font-extrabold uppercase tracking-widest text-[11px]">Modo Anônimo Blocked</span>
                </>
              ) : status === ConnectionStatus.CONNECTED ? (
                <>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: [12, 35, 12] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                        className="w-1.5 bg-slate-900 rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-slate-900 font-extrabold uppercase tracking-[0.2em] text-[11px]">Ouvindo você...</span>
                </>
              ) : status === ConnectionStatus.CONNECTING ? (
                <div className="w-8 h-8 border-4 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#010816" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                  <span className="text-slate-900 font-extrabold uppercase tracking-[0.2em] text-[11px]">Toque para Traduzir</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      <footer className="px-6 py-8 border-t border-white/5 bg-black/20">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 px-4">
            <span onClick={() => setShowPrivacy(true)} className="hover:text-blue-500 cursor-pointer transition-colors px-2 py-1">Privacidade</span>
            <span onClick={() => setShowTerms(true)} className="hover:text-blue-500 cursor-pointer transition-colors px-2 py-1">Termos</span>
            <span onClick={() => setShowSupport(true)} className="hover:text-blue-500 cursor-pointer transition-colors px-2 py-1">Suporte</span>
            <span
              onClick={handleShareReward}
              className="text-orange-500 hover:text-orange-400 cursor-pointer transition-colors font-bold px-4 py-1.5 border border-orange-500/20 rounded-full bg-orange-500/5 active:scale-95"
            >
              Compartilhar App 🚀
            </span>
          </div>
          <p className="opacity-50">© 2026 Sandro Enterprise • All rights reserved</p>
        </div>
      </footer>

      <SocialProof />

      {/* Floating WhatsApp Support Button */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 hover:scale-110 active:scale-95 transition-all animate-bounce duration-[3000ms]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.18-2.18a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
      </a>

      {
        showOnboarding && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="bg-[#0f172a] border border-blue-500/30 p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl shadow-blue-500/10">
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-4">Bem-vindo ao ChatOLingo!</h2>
              <div className="space-y-4 text-left mb-8">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                  <p className="text-xs text-slate-400 font-bold leading-tight">Escolha os idiomas e clique no botão circular azul abaixo.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                  <p className="text-xs text-slate-400 font-bold leading-tight">Clique em <strong className="text-white">"Permitir"</strong> quando o navegador pedir acesso ao microfone.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                  <p className="text-xs text-slate-400 font-bold leading-tight">Comece a falar naturalmente. A IA traduzirá em tempo real!</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowOnboarding(false);
                  localStorage.setItem('chatolingo_onboarding_done', 'true');
                }}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95"
              >
                Imersão Total 🚀
              </button>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default App;