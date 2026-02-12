import React from 'react';

interface LegalPageProps {
    type: 'privacy' | 'terms';
    onBack: () => void;
}

const LegalPage: React.FC<LegalPageProps> = ({ type, onBack }) => {
    const isPrivacy = type === 'privacy';

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FFF5EB] to-[#FAF8F5] text-slate-700 overflow-y-auto pb-20 animate-in fade-in duration-500">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, #FFB84D 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            {/* Header */}
            <nav className="p-6 flex items-center justify-between border-b border-orange-200/30 bg-[#FAF8F5]/80 backdrop-blur-md sticky top-0 z-50">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    <span className="text-xs font-bold uppercase tracking-widest">Voltar</span>
                </button>
                <div className="flex items-center gap-3">
                    {/* Owl logo in speech bubble */}
                    <div className="relative">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center">
                            <div className="text-2xl">🦉</div>
                        </div>
                        <div className="absolute -bottom-1 left-2 w-2 h-2 bg-white rotate-45 shadow-md" />
                    </div>
                    <div className="flex items-center font-black text-lg tracking-tight">
                        <span className="text-[#FF6B35]">Chat</span>
                        <span className="text-[#FFB84D]">Olingo</span>
                        <span className="text-[#FF6B35] ml-1">AI</span>
                    </div>
                </div>
                <div className="w-10" />
            </nav>

            <div className="max-w-3xl mx-auto px-6 py-12 relative z-10">
                <h1 className="text-3xl font-black text-slate-800 mb-8 border-l-4 border-orange-500 pl-6 uppercase tracking-tight">
                    {isPrivacy ? 'Política de Privacidade' : 'Termos de Uso'}
                </h1>

                <div className="space-y-8 text-sm leading-relaxed font-medium">
                    {isPrivacy ? (
                        <>
                            <section className="space-y-4">
                                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">1. Introdução</h2>
                                <p>No ChatOLingo AI, a sua privacidade é nossa prioridade fundamental. Esta política descreve como coletamos e utilizamos suas informações ao usar nosso serviço de tradução em tempo real.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">2. Dados de Áudio</h2>
                                <p>Para fornecer a tradução simultânea, o ChatOLingo AI processa fragmentos de áudio através da API do Google Gemini. <strong className="text-orange-600">Não armazenamos o áudio original em nossos servidores permanentemente.</strong> O processamento ocorre em tempo real para gerar a tradução solicitada.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">3. Dados Pessoais</h2>
                                <p>Coletamos apenas informações essenciais para o funcionamento da conta Premium, como e-mail de compra processado via Kiwify. O histórico de tradução é armazenado localmente no seu dispositivo (LocalStorage) para sua conveniência e pode ser limpo por você a qualquer momento.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">4. Compartilhamento de Dados</h2>
                                <p>Não vendemos nem compartilhamos seus dados com terceiros para fins publicitários. Os dados são enviados exclusivamente aos modelos de IA do Google para execução da tarefa de tradução.</p>
                            </section>
                        </>
                    ) : (
                        <>
                            <section className="space-y-4">
                                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">1. Aceite dos Termos</h2>
                                <p>Ao acessar o ChatOLingo AI, você concorda em cumprir estes termos de serviço e todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar este site.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">2. Licença de Uso</h2>
                                <p>É concedida permissão para usar o ChatOLingo AI conforme o plano escolhido (Gratuito ou Premium). O plano gratuito possui limites diários de tempo que podem ser alterados sem aviso prévio. O plano Premium oferece acesso ilimitado conforme a validade da assinatura.</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">3. Isenção de Responsabilidade</h2>
                                <p>A tradução por IA, embora avançada, pode conter erros. O ChatOLingo AI não garante a precisão absoluta das traduções e não se responsabiliza por mal-entendidos decorrentes do uso da ferramenta em situações críticas (como procedimentos médicos ou jurídicos sem acompanhamento profissional).</p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">4. Propriedade Intelectual</h2>
                                <p>Todo o design, código e marca "ChatOLingo AI" são de propriedade exclusiva da Selecta Sandro Enterprise. O uso comercial desautorizado de nossa infraestrutura é estritamente proibido.</p>
                            </section>
                        </>
                    )}

                    <div className="pt-12 border-t border-orange-200/50 text-[10px] uppercase tracking-widest text-slate-500">
                        Última atualização: Fevereiro de 2026 • © ChatOLingo AI
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;
