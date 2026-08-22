import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  MapPin, 
  Home, 
  DollarSign, 
  BarChart3, 
  ShieldCheck, 
  Layers, 
  Headphones, 
  Check, 
  Sparkles,
  Building2,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { userRole, setUserRole } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(userRole);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate instantaneous authentication
    setTimeout(() => {
      setUserRole(selectedRole);
      setLoading(false);
      setSuccessMessage(isSignUp ? 'Conta criada com sucesso!' : 'Login realizado com sucesso!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 900);
    }, 600);
  };

  const handleQuickDemo = (role: UserRole) => {
    setUserRole(role);
    setSuccessMessage(`Conectado como ${role === 'LANDLORD' ? 'Locador' : 'Inquilino'}!`);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/90 backdrop-blur-2xl animate-fade-in">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      
      {/* Main Container */}
      <div className="relative w-full max-w-6xl rounded-3xl glass-panel border border-cyan-500/30 bg-[#070d1d]/95 shadow-[0_0_80px_rgba(0,242,254,0.15)] overflow-hidden my-auto flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-800"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Grid (Left Hero Showcase + Right Auth Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 p-6 sm:p-10 lg:p-12 items-center">
          
          {/* ================= LEFT COLUMN: HERO VALUE PROPOSITION ================= */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            
            {/* Top Interactive Mini 3D Map Mockup with Floating Price Beacons */}
            <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-cyan-500/30 bg-gradient-to-b from-[#0a1226] to-[#060b18] shadow-inner p-4 flex items-center justify-center">
              {/* Perspective Grid Background */}
              <div className="absolute inset-0 hud-grid-bg opacity-30 pointer-events-none" />
              
              {/* Radial City Map Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />

              {/* Holographic Glowing Street Lines */}
              <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                <path d="M 50 180 Q 150 60 300 120 T 550 40" stroke="#00f2fe" strokeWidth="2" fill="none" strokeDasharray="6,6" />
                <path d="M 20 50 Q 200 150 400 80 T 600 160" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
                <path d="M 120 200 L 280 40 L 450 190" stroke="#a855f7" strokeWidth="1" fill="none" strokeDasharray="4,4" />
              </svg>

              {/* Floating Price Tags Floating in 3D Space */}
              <div className="absolute top-6 left-8 animate-bounce duration-1000">
                <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-mono font-bold text-white">R$ 1.200</span>
                </div>
              </div>

              <div className="absolute top-8 right-16">
                <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-400/80 shadow-[0_0_15px_rgba(0,242,254,0.5)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span className="text-xs font-mono font-bold text-white">R$ 950</span>
                </div>
              </div>

              <div className="absolute bottom-6 left-16">
                <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  <span className="text-xs font-mono font-bold text-white">R$ 1.800</span>
                </div>
              </div>

              <div className="absolute bottom-8 right-24">
                <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.5)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                  <span className="text-xs font-mono font-bold text-white">R$ 2.200</span>
                </div>
              </div>

              <div className="text-center z-10 pointer-events-none">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyber-cyan/80 bg-slate-950/80 px-3 py-1 rounded-full border border-cyan-500/30">
                  DIGITAL TWIN • MAPEAMENTO EM TEMPO REAL
                </span>
              </div>
            </div>

            {/* Headline & Value Proposition */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                O lugar certo.<br />
                A gestão completa.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 font-mono">
                  Tudo em um só app.
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Encontre imóveis para alugar no mapa 3D, feche negócio com total segurança e gerencie sua locação, pagamentos e manutenções de forma simples e rápida.
              </p>
            </div>

            {/* 4 Feature Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Item 1 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl glass-panel border border-cyan-500/20 bg-slate-950/50 hover:border-cyan-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyber-cyan shrink-0 shadow-neon-cyan">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Explore no mapa</h4>
                  <p className="text-xs text-slate-400 leading-snug">Veja imóveis disponíveis ao seu redor em tempo real com visão 3D.</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl glass-panel border border-blue-500/20 bg-slate-950/50 hover:border-blue-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-sm">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Alugue com praticidade</h4>
                  <p className="text-xs text-slate-400 leading-snug">Converse diretamente com o locador, agende visitas e feche negócio pelo app.</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl glass-panel border border-purple-500/20 bg-slate-950/50 hover:border-purple-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-sm">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Gerencie sua locação</h4>
                  <p className="text-xs text-slate-400 leading-snug">Acompanhe pagamentos em dia, contrato digital, manutenções e documentos.</p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl glass-panel border border-emerald-500/20 bg-slate-950/50 hover:border-emerald-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Controle suas finanças</h4>
                  <p className="text-xs text-slate-400 leading-snug">Tenha uma visão clara e completa dos seus rendimentos, despesas e extratos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: AUTH CARD ================= */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/40 bg-slate-950/90 shadow-[0_0_40px_rgba(0,242,254,0.15)] relative">
              
              {/* Top Card Glow */}
              <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

              {/* Brand Header with Logo */}
              <div className="flex flex-col items-center text-center mb-6">
                <img 
                  src="/logo.png" 
                  alt="LOCASH" 
                  className="w-16 h-16 object-contain drop-shadow-[0_0_20px_rgba(0,242,254,0.6)] mb-2.5 transform hover:scale-105 transition-transform"
                />
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-2xl tracking-widest text-white font-mono">
                    LOCA<span className="text-cyber-cyan">SH</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-0.5">
                  IMÓVEIS • LOCAÇÃO • FINANÇAS
                </span>
              </div>

              {/* Welcome Title */}
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {isSignUp ? 'Criar sua conta' : 'Bem-vindo ao '}
                  {!isSignUp && <span className="text-cyber-cyan font-mono">LOCASH</span>}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isSignUp ? 'Preencha seus dados para começar' : 'Entre para continuar'}
                </p>
              </div>

              {/* Role Toggle Selector */}
              <div className="flex rounded-xl p-1 bg-slate-900/90 border border-slate-800 mb-5">
                <button
                  type="button"
                  onClick={() => setSelectedRole('TENANT')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'TENANT' 
                      ? 'bg-cyan-500/20 text-cyber-cyan border border-cyan-500/40 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Inquilino</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('LANDLORD')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'LANDLORD' 
                      ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Locador</span>
                </button>
              </div>

              {/* Success Notification */}
              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <Check className="w-4 h-4" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Nome Completo</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">E-mail</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">Senha</label>
                    {!isSignUp && (
                      <button 
                        type="button" 
                        onClick={() => alert('Link de recuperação enviado para seu e-mail!')}
                        className="text-[11px] text-cyber-cyan hover:underline"
                      >
                        Esqueceu sua senha?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Main Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:to-teal-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      Processando...
                    </span>
                  ) : (
                    <>
                      <span>{isSignUp ? 'Cadastrar e Entrar' : 'Entrar'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Social Login Separator */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative px-3 bg-[#070d1d] text-[11px] text-slate-400 font-mono">
                  ou continue com
                </span>
              </div>

              {/* Social Buttons */}
              <div className="space-y-2.5">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo(selectedRole)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-3 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z" />
                  </svg>
                  <span>Google</span>
                </button>

                {/* Apple Button */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo(selectedRole)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-3 transition-colors"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.88c.64-.78 1.08-1.86.96-2.94-1 .04-2.17.65-2.85 1.44-.59.68-1.11 1.77-.97 2.83 1.11.09 2.22-.55 2.86-1.33z" />
                  </svg>
                  <span>Apple</span>
                </button>
              </div>

              {/* Bottom Toggle Between Login and Sign Up */}
              <div className="text-center mt-6">
                <p className="text-xs text-slate-400">
                  {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="ml-1.5 text-cyber-cyan font-bold hover:underline"
                  >
                    {isSignUp ? 'Entrar' : 'Criar conta'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM FOOTER: TRUST & SECURITY BADGES ================= */}
        <div className="border-t border-slate-800/80 bg-slate-950/70 px-6 sm:px-12 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
            
            <div className="flex items-center sm:items-start gap-3 justify-center sm:justify-start">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyber-cyan shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Seguro e confiável</h5>
                <p className="text-[11px] text-slate-400">Seus dados protegidos com criptografia avançada.</p>
              </div>
            </div>

            <div className="flex items-center sm:items-start gap-3 justify-center sm:justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Tudo em um só lugar</h5>
                <p className="text-[11px] text-slate-400">Do aluguel ao financeiro, sem sair do app.</p>
              </div>
            </div>

            <div className="flex items-center sm:items-start gap-3 justify-center sm:justify-start">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">Suporte dedicado</h5>
                <p className="text-[11px] text-slate-400">Conte com nosso time sempre que precisar.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
