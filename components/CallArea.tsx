
import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';
import { motion } from 'framer-motion';
import { UserProfile, Language } from '../types';
import { AGORA_APP_ID } from '../agora_config';

interface CallAreaProps {
    profile: UserProfile;
    onBack: () => void;
    onShowPricing: () => void;
}

const CallArea: React.FC<CallAreaProps> = ({ profile, onBack, onShowPricing }) => {
    const [inCall, setInCall] = useState(false);
    const [channelName, setChannelName] = useState('');
    const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

    useEffect(() => {
        if (!profile.isPremium) {
            onShowPricing();
            onBack();
        }
    }, [profile, onBack, onShowPricing]);

    useEffect(() => {
        return () => {
            leaveCall();
        };
    }, []);

    const joinCall = async () => {
        if (!channelName) {
            setError('Por favor, digite o nome da sala (ID).');
            return;
        }

        if (AGORA_APP_ID === 'SUA_AGORA_APP_ID_AQUI') {
            setError('Configuração do Agora.io pendente. Por favor, adicione seu App ID.');
            return;
        }

        try {
            clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

            // Listen for remote users
            clientRef.current.on('user-published', async (user, mediaType) => {
                await clientRef.current?.subscribe(user, mediaType);
                if (mediaType === 'audio') {
                    user.audioTrack?.play();
                    setRemoteUsers(prev => [...prev, user]);
                }
            });

            clientRef.current.on('user-unpublished', (user) => {
                setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
            });

            // Join channel
            const uid = await clientRef.current.join(AGORA_APP_ID, channelName, null, null);

            // Create and publish local audio
            localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack({
                encoderConfig: "speech_low_quality"
            });
            await clientRef.current.publish(localAudioTrackRef.current);

            setInCall(true);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError('Falha ao entrar na chamada: ' + err.message);
        }
    };

    const leaveCall = async () => {
        localAudioTrackRef.current?.stop();
        localAudioTrackRef.current?.close();
        await clientRef.current?.leave();
        setInCall(false);
        setRemoteUsers([]);
    };

    if (!profile.isPremium) return null;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8 bg-gradient-to-b from-[#010816] to-[#0a1a3a]">
            <header className="w-full max-w-2xl flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                    Voltar
                </button>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                    Área VIP Premium
                </div>
            </header>

            <div className="w-full max-w-sm bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center gap-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${inCall ? 'bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)] animate-pulse' : 'bg-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.2)]'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.18-2.18a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                </div>

                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Chamada VIP Traduzida</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                        {inCall ? 'Em chamada ativa...' : 'Compartilhe o ID com outra pessoa para começar.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-2xl text-[10px] text-red-400 font-bold uppercase tracking-widest">
                        {error}
                    </div>
                )}

                {!inCall ? (
                    <div className="w-full space-y-4">
                        <input
                            type="text"
                            placeholder="Digite o ID da Sala (ex: 123)"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-center text-white font-black uppercase tracking-widest focus:border-blue-500 outline-none placeholder:text-slate-600 transition-all shadow-inner"
                        />
                        <button
                            onClick={joinCall}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                        >
                            Iniciar Chamada
                        </button>
                    </div>
                ) : (
                    <div className="w-full space-y-6">
                        <div className="flex gap-2 justify-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Conectado - Sala {channelName}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pessoas na sala: {remoteUsers.length + 1}</p>
                        </div>

                        <button
                            onClick={leaveCall}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-red-600/20 active:scale-95 transition-all"
                        >
                            Encerrar Chamada
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-8 bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl max-w-sm text-center">
                <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-2">Como funciona?</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    A tradução simultânea acontece automaticamente durante a chamada. Em breve, você poderá escolher o idioma de entrada e saída.
                </p>
            </div>
        </div>
    );
};

export default CallArea;
