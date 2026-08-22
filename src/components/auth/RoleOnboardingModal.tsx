import React, { useState } from 'react';
import { 
  Home, 
  Building2, 
  Check, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  KeyRound 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { supabase } from '../../services/supabase';

export const RoleOnboardingModal: React.FC = () => {
  const { 
    currentUser, 
    setUserRole, 
    isRoleOnboardingOpen, 
    setIsRoleOnboardingOpen 
  } = useApp();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('TENANT');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isRoleOnboardingOpen || !currentUser) return null;

  const handleConfirmRole = async () => {
    try {
      setLoading(true);

      // 1. Update Supabase Auth user metadata
      await supabase.auth.updateUser({
        data: {
          role: selectedRole,
          role_confirmed: true
        }
      });

      // 2. Update profiles table
      try {
        await supabase.from('profiles').upsert({
          id: currentUser.id,
          role: selectedRole,
          role_confirmed: true
        });
      } catch (dbErr) {
        console.warn('Profiles role update:', dbErr);
      }

      // 3. Update application context
      setUserRole(selectedRole);
      setSuccess(true);

      setTimeout(() => {
        setIsRoleOnboardingOpen(false);
      }, 700);
    } catch (err) {
      console.error('Erro ao salvar tipo de conta:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/45 backdrop-blur-md animate-fade-in">
      {/* Cyber Glass Role Selection Card */}
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-cyan-500/40 bg-[#070d1d]/95 p-6 sm:p-8 shadow-[0_0_60px_rgba(0,242,254,0.25)] my-auto overflow-hidden animate-scale-up">
        
        {/* Top Edge Ambient Light Bar */}
        <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00f2fe]" />

        {/* User Greeting with Avatar */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative mb-3">
            {currentUser.avatarUrl ? (
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.name}
                className="w-16 h-16 rounded-full border-2 border-cyan-400 object-cover shadow-[0_0_20px_rgba(0,242,254,0.4)]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-[0_0_20px_rgba(0,242,254,0.4)]">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full border border-cyan-400 text-cyan-400 shadow">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <span className="text-[11px] font-mono text-cyber-cyan uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Conectado com sucesso!
          </span>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Olá, {currentUser.name}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-sm">
            Como você deseja utilizar a <strong className="text-white">LOCASH</strong>?
          </p>
        </div>

        {/* 2 Big Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          
          {/* Card 1: Locatário (Inquilino) */}
          <button
            type="button"
            onClick={() => setSelectedRole('TENANT')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer relative ${
              selectedRole === 'TENANT'
                ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_25px_rgba(0,242,254,0.25)] ring-1 ring-cyan-400'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 text-slate-400'
            }`}
          >
            {selectedRole === 'TENANT' && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}

            <div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                selectedRole === 'TENANT' 
                  ? 'bg-cyan-500/25 text-cyber-cyan' 
                  : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
              }`}>
                <Home className="w-5 h-5" />
              </div>

              <h3 className={`text-sm font-bold mb-1 ${
                selectedRole === 'TENANT' ? 'text-white' : 'text-slate-200'
              }`}>
                Locatário (Inquilino)
              </h3>
              
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Quero buscar imóveis no mapa 3D, agendar visitas e alugar com facilidade.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1 text-[10px] font-mono text-cyber-cyan">
              <Compass className="w-3 h-3" />
              <span>Acesso a buscas e visitas</span>
            </div>
          </button>

          {/* Card 2: Locador (Proprietário) */}
          <button
            type="button"
            onClick={() => setSelectedRole('LANDLORD')}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer relative ${
              selectedRole === 'LANDLORD'
                ? 'bg-purple-600/20 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.25)] ring-1 ring-purple-400'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 text-slate-400'
            }`}
          >
            {selectedRole === 'LANDLORD' && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-400 text-slate-950 flex items-center justify-center shadow">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}

            <div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                selectedRole === 'LANDLORD' 
                  ? 'bg-purple-600/30 text-purple-300' 
                  : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
              }`}>
                <Building2 className="w-5 h-5" />
              </div>

              <h3 className={`text-sm font-bold mb-1 ${
                selectedRole === 'LANDLORD' ? 'text-white' : 'text-slate-200'
              }`}>
                Locador (Proprietário)
              </h3>
              
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Quero anunciar meus imóveis, receber contatos e gerenciar finanças.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1 text-[10px] font-mono text-purple-300">
              <KeyRound className="w-3 h-3" />
              <span>Painel de gestão e anúncios</span>
            </div>
          </button>

        </div>

        {/* Submit Confirmation Button */}
        <button
          type="button"
          onClick={handleConfirmRole}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:to-teal-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              Salvando preferências...
            </span>
          ) : success ? (
            <span className="flex items-center gap-2 text-slate-950">
              <Check className="w-4 h-4" />
              Tudo pronto! Entrando...
            </span>
          ) : (
            <>
              <span>Confirmar e Começar na LOCASH</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

      </div>
    </div>
  );
};