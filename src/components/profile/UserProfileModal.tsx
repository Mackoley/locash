import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Save, 
  CreditCard, 
  MapPin, 
  Building, 
  Home,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../services/supabase';

// DDD to Brazilian Region Helper
const DDD_REGIONS: Record<string, string> = {
  '11': 'SP • São Paulo Capital / RMSP',
  '12': 'SP • Vale do Paraíba / Litoral',
  '13': 'SP • Baixada Santista',
  '14': 'SP • Bauru / Jaú / Marília',
  '15': 'SP • Sorocaba / Itapetininga',
  '16': 'SP • Ribeirão Preto / Franca',
  '17': 'SP • São José do Rio Preto',
  '18': 'SP • Presidente Prudente / Araçatuba',
  '19': 'SP • Campinas / Piracicaba',
  '21': 'RJ • Rio de Janeiro Capital / RMRJ',
  '22': 'RJ • Campos / Macaé / Cabo Frio',
  '24': 'RJ • Petrópolis / Volta Redonda',
  '27': 'ES • Vitória / Vila Velha',
  '28': 'ES • Cachoeiro de Itapemirim',
  '31': 'MG • Belo Horizonte Capital / RMBH',
  '32': 'MG • Juiz de Fora / Barbacena',
  '33': 'MG • Governador Valadares',
  '34': 'MG • Uberlândia / Uberaba',
  '35': 'MG • Poços de Caldas / Pouso Alegre',
  '37': 'MG • Divinópolis / Itaúna',
  '38': 'MG • Montes Claros',
  '41': 'PR • Curitiba Capital / RMC',
  '42': 'PR • Ponta Grossa / Guarapuava',
  '43': 'PR • Londrina / Apucarana',
  '44': 'PR • Maringá / Campo Mourão',
  '45': 'PR • Cascavel / Foz do Iguaçu',
  '46': 'PR • Francisco Beltrão / Pato Branco',
  '47': 'SC • Joinville / Blumenau / Balneário',
  '48': 'SC • Florianópolis / Criciúma',
  '49': 'SC • Chapecó / Lages',
  '51': 'RS • Porto Alegre Capital / RMPA',
  '53': 'RS • Pelotas / Rio Grande',
  '54': 'RS • Caxias do Sul / Passo Fundo',
  '55': 'RS • Santa Maria / Uruguaiana',
  '61': 'DF • Brasília / Entorno',
  '62': 'GO • Goiânia / Anápolis',
  '63': 'TO • Palmas / Araguaína',
  '64': 'GO • Rio Verde / Itumbiara',
  '65': 'MT • Cuiabá / Várzea Grande',
  '66': 'MT • Rondonópolis / Sinop',
  '67': 'MS • Campo Grande / Dourados',
  '68': 'AC • Rio Branco / Cruzeiro do Sul',
  '69': 'RO • Porto Velho / Ji-Paraná',
  '71': 'BA • Salvador Capital / RMS',
  '73': 'BA • Ilhéus / Itabuna / Porto Seguro',
  '74': 'BA • Juazeiro / Irecê',
  '75': 'BA • Feira de Santana',
  '77': 'BA • Vitória da Conquista / Barreiras',
  '79': 'SE • Aracaju / Itabaiana',
  '81': 'PE • Recife Capital / RMR',
  '82': 'AL • Maceió / Arapiraca',
  '83': 'PB • João Pessoa / Campina Grande',
  '84': 'RN • Natal / Mossoró',
  '85': 'CE • Fortaleza Capital / RMF',
  '86': 'PI • Teresina / Parnaíba',
  '87': 'PE • Petrolina / Caruaru',
  '88': 'CE • Juazeiro do Norte / Sobral',
  '89': 'PI • Picos / Floriano',
  '91': 'PA • Belém Capital / RMB',
  '92': 'AM • Manaus Capital / RMM',
  '93': 'PA • Santarém / Altamira',
  '94': 'PA • Marabá / Parauapebas',
  '95': 'RR • Boa Vista',
  '96': 'AP • Macapá / Santana',
  '97': 'AM • Interior do Amazonas',
  '98': 'MA • São Luís Capital / RMSL',
  '99': 'MA • Imperatriz / Caxias'
};

const formatBrazilianPhone = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const formatBrazilianCpf = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

export const UserProfileModal: React.FC = () => {
  const { 
    currentUser, 
    userRole, 
    isProfileModalOpen, 
    setIsProfileModalOpen 
  } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load profile data when modal opens
  useEffect(() => {
    if (isProfileModalOpen && currentUser) {
      setName(currentUser.name || '');
      setNewPassword('');
      setConfirmNewPassword('');
      setErrorMessage(null);
      setSuccessMessage(null);

      // Fetch latest profile from DB
      const loadProfile = async () => {
        try {
          setFetchingProfile(true);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (data && !error) {
            if (data.full_name) setName(data.full_name);
            if (data.phone) setPhone(formatBrazilianPhone(data.phone));
            if (data.cpf) setCpf(formatBrazilianCpf(data.cpf));
          } else {
            // Check local storage phone map as fallback
            const map = JSON.parse(localStorage.getItem('locash_phone_accounts') || '{}');
            for (const [key, em] of Object.entries(map)) {
              if (em === currentUser.email && key.length >= 10) {
                setPhone(formatBrazilianPhone(key));
                break;
              }
            }
          }
        } catch (err) {
          console.warn('Erro ao carregar perfil:', err);
        } finally {
          setFetchingProfile(false);
        }
      };

      loadProfile();
    }
  }, [isProfileModalOpen, currentUser]);

  if (!isProfileModalOpen || !currentUser) return null;

  // DDD region detector
  const phoneDigits = phone.replace(/\D/g, '');
  const ddd = phoneDigits.slice(0, 2);
  const dddRegionInfo = ddd.length === 2 && DDD_REGIONS[ddd] ? DDD_REGIONS[ddd] : null;

  const handlePhoneChange = (val: string) => {
    setPhone(formatBrazilianPhone(val));
  };

  const handleCpfChange = (val: string) => {
    setCpf(formatBrazilianCpf(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (!name.trim()) {
        throw new Error('Por favor, informe seu nome completo.');
      }

      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone && cleanPhone.length < 10) {
        throw new Error('Por favor, digite um telefone válido com DDD (10 ou 11 dígitos).');
      }

      const cleanCpf = cpf.replace(/\D/g, '');
      if (cleanCpf && cleanCpf.length > 0 && cleanCpf.length !== 11) {
        throw new Error('O CPF deve conter exatamente 11 dígitos.');
      }

      // Password change validation if provided
      if (newPassword.trim()) {
        if (newPassword.length < 6) {
          throw new Error('A nova senha deve conter no mínimo 6 caracteres.');
        }
        if (newPassword !== confirmNewPassword) {
          throw new Error('As senhas não coincidem. Verifique a confirmação.');
        }
      }

      // 1. Update Supabase Auth user metadata & password if changed
      const updateData: any = {
        data: {
          full_name: name.trim(),
          phone: phone ? formatBrazilianPhone(phone) : null,
          phone_raw: cleanPhone || null,
          cpf: cpf ? formatBrazilianCpf(cpf) : null,
          cpf_raw: cleanCpf || null
        }
      };

      if (newPassword.trim()) {
        updateData.password = newPassword;
      }

      const { error: authErr } = await supabase.auth.updateUser(updateData);
      if (authErr) throw authErr;

      // 2. Update profiles table
      const profilePayload: any = {
        id: currentUser.id,
        email: currentUser.email,
        full_name: name.trim(),
        phone: phone ? formatBrazilianPhone(phone) : null,
        cpf: cpf ? formatBrazilianCpf(cpf) : null,
        updated_at: new Date().toISOString()
      };

      try {
        await supabase.from('profiles').upsert(profilePayload);
      } catch (dbErr) {
        console.warn('Profile table upsert:', dbErr);
      }

      // 3. Cache phone in local storage
      if (cleanPhone) {
        try {
          const map = JSON.parse(localStorage.getItem('locash_phone_accounts') || '{}');
          map[cleanPhone] = currentUser.email.toLowerCase();
          map[formatBrazilianPhone(phone)] = currentUser.email.toLowerCase();
          localStorage.setItem('locash_phone_accounts', JSON.stringify(map));
        } catch (e) {}
      }

      setSuccessMessage('Perfil atualizado com sucesso!');
      setNewPassword('');
      setConfirmNewPassword('');

      setTimeout(() => {
        setIsProfileModalOpen(false);
      }, 1200);

    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setErrorMessage(err.message || 'Erro ao salvar alterações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/45 backdrop-blur-md animate-fade-in">
      {/* Cyber Glass Profile Card */}
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-cyan-500/40 bg-[#070d1d]/95 p-6 sm:p-8 shadow-[0_0_60px_rgba(0,242,254,0.22)] my-auto overflow-hidden animate-scale-up">
        
        {/* Top Edge Ambient Light Bar */}
        <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00f2fe]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsProfileModalOpen(false)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-800 cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* User Header with Avatar and Role Badge */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="relative mb-2.5">
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

          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            Meu Perfil na LOCASH
          </h2>
          
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
              userRole === 'LANDLORD'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
            }`}>
              {userRole === 'LANDLORD' ? <Building className="w-3 h-3" /> : <Home className="w-3 h-3" />}
              <span>{userRole === 'LANDLORD' ? 'LOCADOR (PROPRIETÁRIO)' : 'LOCATÁRIO (INQUILINO)'}</span>
            </span>
          </div>
        </div>

        {/* Feedback Messages */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Nome Completo */}
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
                className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* E-mail (Somente Leitura) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">E-mail Cadastrado</label>
              <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verificado
              </span>
            </div>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full bg-slate-900/40 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-400 cursor-not-allowed select-all"
              />
            </div>
          </div>

          {/* Telefone / WhatsApp com DDD automático */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">Número de Telefone (WhatsApp)</label>
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
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                maxLength={15}
                className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {/* CPF (Não Obrigatório / Opcional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">CPF</label>
              <span className="text-[10px] font-mono text-slate-400">
                (Opcional)
              </span>
            </div>
            <div className="relative flex items-center">
              <CreditCard className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          {/* Seção Alterar Senha */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyber-cyan" />
                Alterar Senha
              </span>
              <span className="text-[10px] text-slate-400">
                (Deixe em branco para manter a atual)
              </span>
            </div>

            {/* Nova Senha */}
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha (mín. 6 dígitos)"
                className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirmar Nova Senha */}
            {newPassword.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">Confirmar Nova Senha</span>
                  {confirmNewPassword && (
                    <span className={`text-[10px] font-mono font-bold flex items-center gap-1 ${
                      newPassword === confirmNewPassword ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {newPassword === confirmNewPassword ? '✓ Senhas coincidem' : '✗ Senhas diferentes'}
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className={`absolute left-3.5 w-4 h-4 ${
                    confirmNewPassword && newPassword === confirmNewPassword ? 'text-emerald-400' : 'text-slate-400'
                  }`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className={`w-full bg-slate-900/80 border rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      confirmNewPassword
                        ? newPassword === confirmNewPassword
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
          </div>

          {/* Botão Salvar Alterações */}
          <button
            type="submit"
            disabled={loading || fetchingProfile}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:to-teal-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                Salvando alterações...
              </span>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Salvar Alterações do Perfil</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};