import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Home, 
  Building2, 
  Check, 
  User, 
  AlertCircle,
  KeyRound,
  Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { userRole, setUserRole } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('TENANT');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase não está configurado.');
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Erro ao conectar com Google:', err);
      setErrorMessage(err.message || 'Erro ao conectar com o Google.');
      setLoading(false);
    }
  };

  // Password Recovery
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Por favor, informe seu e-mail para recuperar a senha.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      setSuccessMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      setTimeout(() => {
        setIsForgotPassword(false);
      }, 3500);
    } catch (err: any) {
      console.error('Erro de recuperação:', err);
      setErrorMessage(err.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  // Real Sign In / Sign Up Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isSignUp) {
        if (password.length < 6) {
          throw new Error('A senha deve conter no mínimo 6 caracteres.');
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              role: selectedRole
            }
          }
        });

        if (error) throw error;

        // Upsert initial profile
        if (data.user) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: email.trim(),
              full_name: name.trim(),
              role: selectedRole
            });
          } catch (profileErr) {
            console.warn('Profile sync:', profileErr);
          }
        }

        setUserRole(selectedRole);
        setSuccessMessage('Conta criada com sucesso! Bem-vindo ao LOCASH.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;

        if (data.user) {
          const userMeta = data.user.user_metadata || {};
          const role = (userMeta.role as UserRole) || userRole;
          setUserRole(role);
        }

        setSuccessMessage('Login realizado com sucesso!');
      }

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Erro de autenticação:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setErrorMessage('E-mail ou senha incorretos.');
      } else if (err.message?.includes('User already registered')) {
        setErrorMessage('Este e-mail já possui uma conta cadastrada. Faça login.');
      } else {
        setErrorMessage(err.message || 'Erro ao processar. Verifique seus dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-2xl animate-fade-in">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Cyber Glass Login & Signup Card */}
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-cyan-500/40 bg-[#070d1d]/95 p-6 sm:p-8 shadow-[0_0_60px_rgba(0,242,254,0.18)] my-auto overflow-hidden animate-scale-up">
        
        {/* Top Edge Ambient Light Bar */}
        <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00f2fe]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-800 cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header with Large 3D Logo & Subtitle */}
        <div className="flex flex-col items-center text-center mb-5">
          <img 
            src="/logo.png" 
            alt="LOCASH IMOBILIÁRIA" 
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-[0_0_25px_rgba(0,242,254,0.65)] transform hover:scale-105 transition-transform duration-300"
          />
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-slate-400 mt-2 font-medium">
            IMÓVEIS • LOCAÇÃO • FINANÇAS
          </span>
        </div>

        {/* Toggle between Login and Sign Up Tabs */}
        {!isForgotPassword && (
          <div className="flex rounded-xl p-1 bg-slate-900/90 border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                !isSignUp 
                  ? 'bg-cyan-500/20 text-cyber-cyan border border-cyan-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Entrar na Conta
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                isSignUp 
                  ? 'bg-cyan-500/20 text-cyber-cyan border border-cyan-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>
        )}

        {/* Welcome Title */}
        <div className="text-center mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {isForgotPassword 
              ? 'Recuperar Senha'
              : isSignUp 
                ? 'Crie sua conta no LOCASH' 
                : 'Acesse sua conta'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isForgotPassword 
              ? 'Digite seu e-mail para receber as instruções'
              : isSignUp 
                ? 'Escolha seu tipo de acesso para continuar' 
                : 'Conecte-se para desbloquear imóveis e recursos'}
          </p>
        </div>

        {/* Success Notification */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Forgot Password Flow */}
        {isForgotPassword ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">E-mail Cadastrado</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setErrorMessage(null);
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors"
            >
              Voltar ao Login
            </button>
          </form>
        ) : (
          /* Main Real Login/Sign Up Form */
          <>
            {/* Google OAuth Quick Button at Top */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full mb-4 py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 text-slate-100 text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer group"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z" />
              </svg>
              <span>Continuar com o Google</span>
            </button>

            {/* Separator */}
            <div className="relative my-3.5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative px-3 bg-[#070d1d] text-[10px] text-slate-400 font-mono uppercase">
                ou com e-mail e senha
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* If Sign Up: Select Role (Permanent) */}
              {isSignUp && (
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1.5 text-center uppercase tracking-wider">
                    Tipo de Conta (Definido no Cadastro)
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('TENANT')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        selectedRole === 'TENANT' 
                          ? 'bg-cyan-500/20 text-cyber-cyan border-cyan-500/60 shadow-[0_0_12px_rgba(0,242,254,0.2)]' 
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span>Locatário</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('LANDLORD')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        selectedRole === 'LANDLORD' 
                          ? 'bg-purple-600/25 text-purple-300 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.2)]' 
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Locador (Admin)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name Input (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nome Completo</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">E-mail</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">Senha</label>
                  {!isSignUp && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsForgotPassword(true);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] text-cyber-cyan hover:underline cursor-pointer"
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
                    placeholder={isSignUp ? 'Mínimo de 6 caracteres' : 'Sua senha de acesso'}
                    className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Main Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:to-teal-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    Processando...
                  </span>
                ) : (
                  <>
                    <span>{isSignUp ? 'Criar Conta e Entrar' : 'Entrar no LOCASH'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
