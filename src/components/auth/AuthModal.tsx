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
  Phone,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { supabase, isSupabaseConfigured } from '../../services/supabase';

// Brazilian DDD region recognizer
const DDD_REGIONS: Record<string, string> = {
  '11': 'SP • São Paulo Capital / RMSP',
  '12': 'SP • Vale do Paraíba / Litoral Norte',
  '13': 'SP • Baixada Santista / Litoral Sul',
  '14': 'SP • Bauru / Botucatu / Jaú',
  '15': 'SP • Sorocaba / Itapetininga',
  '16': 'SP • Ribeirão Preto / Franca',
  '17': 'SP • São José do Rio Preto / Barretos',
  '18': 'SP • Presidente Prudente / Araçatuba',
  '19': 'SP • Campinas / Piracicaba / Americana',
  '21': 'RJ • Rio de Janeiro / Grande Rio',
  '22': 'RJ • Campos / Cabo Frio / Região dos Lagos',
  '24': 'RJ • Volta Redonda / Petrópolis / Angra',
  '27': 'ES • Vitória / Vila Velha',
  '28': 'ES • Cachoeiro de Itapemirim / Sul',
  '31': 'MG • Belo Horizonte / Grande BH',
  '32': 'MG • Juiz de Fora / Barbacena',
  '33': 'MG • Governador Valadares / Teófilo Otoni',
  '34': 'MG • Uberlândia / Uberaba / Triângulo',
  '35': 'MG • Poços de Caldas / Pouso Alegre / Sul',
  '37': 'MG • Divinópolis / Centro-Oeste',
  '38': 'MG • Montes Claros / Norte',
  '41': 'PR • Curitiba / Região Metropolitana',
  '42': 'PR • Ponta Grossa / Guarapuava',
  '43': 'PR • Londrina / Apucarana',
  '44': 'PR • Maringá / Campo Mourão',
  '45': 'PR • Cascavel / Foz do Iguaçu',
  '46': 'PR • Francisco Beltrão / Pato Branco',
  '47': 'SC • Joinville / Blumenau / Baln. Camboriú',
  '48': 'SC • Florianópolis / Criciúma',
  '49': 'SC • Chapecó / Lages / Oeste',
  '51': 'RS • Porto Alegre / Região Metropolitana',
  '53': 'RS • Pelotas / Rio Grande',
  '54': 'RS • Caxias do Sul / Serra Gaúcha',
  '55': 'RS • Santa Maria / Passo Fundo',
  '61': 'DF • Brasília / Entorno',
  '62': 'GO • Goiânia / Anápolis',
  '63': 'TO • Palmas / Todo o Estado',
  '64': 'GO • Rio Verde / Itumbiara / Catalão',
  '65': 'MT • Cuiabá / Várzea Grande',
  '66': 'MT • Rondonópolis / Sinop',
  '67': 'MS • Campo Grande / Dourados',
  '68': 'AC • Rio Branco / Todo o Estado',
  '69': 'RO • Porto Velho / Todo o Estado',
  '71': 'BA • Salvador / Região Metropolitana',
  '73': 'BA • Ilhéus / Itabuna / Porto Seguro',
  '74': 'BA • Juazeiro / Irecê / Jacobina',
  '75': 'BA • Feira de Santana / Alagoinhas',
  '77': 'BA • Vitória da Conquista / Barreiras',
  '79': 'SE • Aracaju / Todo o Estado',
  '81': 'PE • Recife / Região Metropolitana',
  '82': 'AL • Maceió / Todo o Estado',
  '83': 'PB • João Pessoa / Campina Grande',
  '84': 'RN • Natal / Mossoró',
  '85': 'CE • Fortaleza / Região Metropolitana',
  '86': 'PI • Teresina / Parnaíba',
  '87': 'PE • Petrolina / Caruaru / Garanhuns',
  '88': 'CE • Juazeiro do Norte / Sobral',
  '89': 'PI • Picos / Floriano',
  '91': 'PA • Belém / Região Metropolitana',
  '92': 'AM • Manaus / Região Metropolitana',
  '93': 'PA • Santarém / Baixo Amazonas',
  '94': 'PA • Marabá / Parauapebas / Carajás',
  '95': 'RR • Boa Vista / Todo o Estado',
  '96': 'AP • Macapá / Santana',
  '97': 'AM • Coari / Tabatinga / Interior',
  '98': 'MA • São Luís / Região Metropolitana',
  '99': 'MA • Imperatriz / Caxias'
};

// Guided formatting for phone with automatic DDD parenthesization and hyphen insertion
const formatBrazilianPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const getDddRegion = (phoneStr: string): string | null => {
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length >= 2) {
    const ddd = digits.slice(0, 2);
    return DDD_REGIONS[ddd] || null;
  }
  return null;
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { userRole, setUserRole } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Registration fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Dual Login field (E-mail ou Telefone)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('TENANT');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const dddRegionInfo = getDddRegion(isSignUp ? phone : loginIdentifier);

  // Handle phone input change with auto guidance
  const handlePhoneChange = (val: string, setter: (v: string) => void) => {
    const formatted = formatBrazilianPhone(val);
    setter(formatted);
  };

  // Handle dual login identifier change
  const handleLoginIdentifierChange = (val: string) => {
    // If user starts with numbers or looks like a phone, apply phone mask
    const hasOnlyDigitsAndPhoneChars = /^[\d\s()+-]+$/.test(val);
    if (hasOnlyDigitsAndPhoneChars && val.length > 0 && !val.includes('@')) {
      setLoginIdentifier(formatBrazilianPhone(val));
    } else {
      setLoginIdentifier(val);
    }
  };

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
    const targetEmail = isSignUp ? email.trim() : loginIdentifier.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMessage('Por favor, informe seu e-mail cadastrado para recuperar a senha.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
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
        // Validation
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error('Por favor, preencha seu Nome e Sobrenome.');
        }

        const cleanPhoneDigits = phone.replace(/\D/g, '');
        if (cleanPhoneDigits.length < 10) {
          throw new Error('Por favor, digite um número de telefone válido com DDD (10 ou 11 dígitos).');
        }

        if (password.length < 6) {
          throw new Error('A senha deve conter no mínimo 6 caracteres.');
        }

        if (password !== confirmPassword) {
          throw new Error('As senhas digitadas não coincidem. Por favor, confirme sua senha.');
        }

        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        const formattedPhone = formatBrazilianPhone(phone);

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              phone: formattedPhone,
              phone_raw: cleanPhoneDigits,
              role: selectedRole
            }
          }
        });

        if (error) throw error;

        // Cache phone-to-email mapping locally on the client
        try {
          const map = JSON.parse(localStorage.getItem('locash_phone_accounts') || '{}');
          map[cleanPhoneDigits] = email.trim().toLowerCase();
          map[formattedPhone] = email.trim().toLowerCase();
          if (cleanPhoneDigits.length >= 8) {
            map[cleanPhoneDigits.slice(-8)] = email.trim().toLowerCase();
            map[cleanPhoneDigits.slice(-9)] = email.trim().toLowerCase();
          }
          localStorage.setItem('locash_phone_accounts', JSON.stringify(map));
        } catch (cacheErr) {}

        // Upsert profile in Supabase table
        if (data.user) {
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: email.trim(),
              full_name: fullName,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              phone: formattedPhone,
              role: selectedRole
            });
          } catch (profileErr) {
            console.warn('Profile sync:', profileErr);
          }
        }

        setUserRole(selectedRole);
        setSuccessMessage('Conta criada com sucesso! Bem-vindo ao LOCASH.');
      } else {
        // Dual Login: Detect if loginIdentifier is email or phone number
        let targetEmail = loginIdentifier.trim().toLowerCase();

        if (!targetEmail.includes('@')) {
          // It's a phone number: search corresponding email
          const cleanPhone = loginIdentifier.replace(/\D/g, '');
          const formattedPhone = formatBrazilianPhone(loginIdentifier);

          // 1. Check local client cache first
          try {
            const map = JSON.parse(localStorage.getItem('locash_phone_accounts') || '{}');
            if (map[cleanPhone]) {
              targetEmail = map[cleanPhone];
            } else if (map[formattedPhone]) {
              targetEmail = map[formattedPhone];
            } else if (cleanPhone.length >= 8 && map[cleanPhone.slice(-8)]) {
              targetEmail = map[cleanPhone.slice(-8)];
            }
          } catch (e) {}

          // 2. If not found in local cache, query Supabase profiles
          if (!targetEmail.includes('@')) {
            try {
              const { data: profileList } = await supabase
                .from('profiles')
                .select('email, phone')
                .or(`phone.eq.${cleanPhone},phone.eq.${formattedPhone},phone.ilike.%${cleanPhone.slice(-8)}%`)
                .limit(1);

              if (profileList && profileList.length > 0 && profileList[0].email) {
                targetEmail = profileList[0].email;
              }
            } catch (dbErr) {
              console.warn('DB phone query:', dbErr);
            }
          }

          if (!targetEmail.includes('@')) {
            throw new Error('Telefone não vinculado neste navegador. Como sua conta foi criada antes da sincronização, por favor faça login digitando seu E-MAIL nesta primeira vez para vincular o telefone!');
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password
        });

        if (error) throw error;

        if (data.user) {
          const userMeta = data.user.user_metadata || {};
          const role = (userMeta.role as UserRole) || userRole;
          setUserRole(role);

          // Cache phone-to-email mapping upon login
          const userPhone = userMeta.phone;
          if (userPhone && data.user.email) {
            const cleanP = userPhone.replace(/\D/g, '');
            try {
              const map = JSON.parse(localStorage.getItem('locash_phone_accounts') || '{}');
              map[cleanP] = data.user.email.toLowerCase();
              map[userPhone] = data.user.email.toLowerCase();
              if (cleanP.length >= 8) {
                map[cleanP.slice(-8)] = data.user.email.toLowerCase();
                map[cleanP.slice(-9)] = data.user.email.toLowerCase();
              }
              localStorage.setItem('locash_phone_accounts', JSON.stringify(map));
            } catch (e) {}
          }
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
        setErrorMessage('E-mail, telefone ou senha incorretos.');
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
        <div className="flex flex-col items-center text-center mb-4">
          <img 
            src="/logo.png" 
            alt="LOCASH IMOBILIÁRIA" 
            className="w-18 h-18 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_25px_rgba(0,242,254,0.65)] transform hover:scale-105 transition-transform duration-300"
          />
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-slate-400 mt-1 font-medium">
            IMÓVEIS • LOCAÇÃO • FINANÇAS
          </span>
        </div>

        {/* Toggle between Login and Sign Up Tabs */}
        {!isForgotPassword && (
          <div className="flex rounded-xl p-1 bg-slate-900/90 border border-slate-800 mb-4">
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
        <div className="text-center mb-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            {isForgotPassword 
              ? 'Recuperar Senha'
              : isSignUp 
                ? 'Criar Conta no LOCASH' 
                : 'Acesse sua conta'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isForgotPassword 
              ? 'Digite seu e-mail para receber as instruções'
              : isSignUp 
                ? 'Preencha seus dados para ter acesso exclusivo' 
                : 'Entre com seu e-mail ou número de telefone'}
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
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
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
              className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Voltar ao Login
            </button>
          </form>
        ) : (
          /* Main Real Login/Sign Up Form */
          <>
            {/* Google OAuth Quick Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full mb-3.5 py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/60 text-slate-100 text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer group"
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
            <div className="relative my-3 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative px-3 bg-[#070d1d] text-[10px] text-slate-400 font-mono uppercase">
                ou com suas credenciais
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* If Sign Up: Select Role (Permanent) */}
              {isSignUp && (
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1 text-center uppercase tracking-wider">
                    Tipo de Conta (Acesso Fixo)
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('TENANT')}
                      className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        selectedRole === 'TENANT' 
                          ? 'bg-cyan-500/20 text-cyber-cyan border-cyan-500/60 shadow-[0_0_12px_rgba(0,242,254,0.2)]' 
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Locatário (Inquilino)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('LANDLORD')}
                      className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        selectedRole === 'LANDLORD' 
                          ? 'bg-purple-600/25 text-purple-300 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.2)]' 
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Locador (Proprietário)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Sign Up: Nome e Sobrenome em 2 caixas lado a lado */}
              {isSignUp && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nome</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ex: Carlos"
                        className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Sobrenome</label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ex: Silva"
                        className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sign Up: Número de Telefone Guiado com DDD e Hífen Automático */}
              {isSignUp && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">Telefone / Celular (WhatsApp)</label>
                    {dddRegionInfo && (
                      <span className="text-[10px] font-mono text-cyber-cyan font-bold flex items-center gap-1 animate-fade-in">
                        <MapPin className="w-3 h-3" />
                        {dddRegionInfo}
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value, setPhone)}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Sign Up: E-mail */}
              {isSignUp && (
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
                      className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Login View: E-mail OU Telefone com reconhecimento */}
              {!isSignUp && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">E-mail ou Telefone</label>
                    {dddRegionInfo && (
                      <span className="text-[10px] font-mono text-cyber-cyan font-bold flex items-center gap-1 animate-fade-in">
                        <MapPin className="w-3 h-3" />
                        {dddRegionInfo}
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    {loginIdentifier.replace(/\D/g, '').length >= 2 && !loginIdentifier.includes('@') ? (
                      <Phone className="absolute left-3.5 w-4 h-4 text-cyber-cyan" />
                    ) : (
                      <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
                    )}
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => handleLoginIdentifierChange(e.target.value)}
                      placeholder="seu@email.com ou (11) 99999-9999"
                      className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

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

              {/* Confirm Password Input (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">Confirmar Senha</label>
                    {confirmPassword && (
                      <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${
                        password === confirmPassword ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {password === confirmPassword ? '✓ Senhas coincidem' : '✗ Senhas diferentes'}
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <Lock className={`absolute left-3.5 w-4 h-4 ${
                      confirmPassword && password === confirmPassword ? 'text-emerald-400' : 'text-slate-400'
                    }`} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita sua senha"
                      className={`w-full bg-slate-900/80 border rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                        confirmPassword 
                          ? password === confirmPassword 
                            ? 'border-emerald-500/60 focus:border-emerald-400' 
                            : 'border-red-500/60 focus:border-red-400'
                          : 'border-slate-800 focus:border-cyan-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

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
