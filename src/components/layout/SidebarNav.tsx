import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Map, 
  Compass, 
  Heart, 
  Home, 
  MessageSquare, 
  LayoutDashboard, 
  Building, 
  PlusCircle,
  FileCheck2,
  ShieldCheck,
  Zap,
  User,
  LogOut,
  ChevronDown,
  Key,
  Plus
} from 'lucide-react';

export const SidebarNav: React.FC = () => {
  const { 
    userRole, 
    activeView, 
    setActiveView, 
    favorites, 
    chatMessages, 
    setIsWizardModalOpen,
    landlordStats,
    energyAccounts,
    currentUser,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
    logout
  } = useApp();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tenantNavItems = [
    { id: 'MAPA', label: 'Mapa Interativo', icon: Map },
    { id: 'EXPLORAR', label: 'Explorar Lista', icon: Compass },
    { id: 'FAVORITOS', label: 'Favoritos', icon: Heart, badge: favorites.length },
    { id: 'CENTRAL_LOCACAO', label: 'Minha Locação', icon: Home, highlight: true },
    { id: 'MENSAGENS', label: 'Mensagens', icon: MessageSquare, badge: chatMessages.length }
  ];

  const landlordNavItems = [
    { id: 'DASHBOARD_LOCADOR', label: 'Carteira Imobiliária', icon: LayoutDashboard },
    { id: 'MAPA', label: 'Mapa de Gestão', icon: Map },
    { id: 'MEUS_IMOVEIS', label: 'Meus Imóveis', icon: Building, badge: landlordStats.totalProperties },
    { id: 'ENERGIA', label: 'Energia & AutoBills', icon: Zap, badge: energyAccounts.length },
    { id: 'CENTRAL_LOCACAO', label: 'Central de Locações', icon: FileCheck2, highlight: true },
    { id: 'MENSAGENS', label: 'Mensagens', icon: MessageSquare, badge: chatMessages.length }
  ];

  const navItems = userRole === 'LANDLORD' ? landlordNavItems : tenantNavItems;

  return (
    <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-800/80 bg-cyber-darkest/98 p-3.5 justify-between select-none shrink-0 h-full overflow-y-auto no-scrollbar z-30">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-800/80">
          <div 
            onClick={() => setActiveView('MAPA')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.3)] group-hover:scale-105 transition-transform">
              <span className="text-slate-950 font-black text-sm tracking-tighter">LC</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1 leading-tight">
                LOCASH <span className="text-[10px] text-cyan-400 font-mono font-bold">2.0</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono tracking-wider uppercase">
                {userRole === 'LANDLORD' ? 'Painel do Locador' : 'Gestão & Locação'}
              </span>
            </div>
          </div>

          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,242,254,0.9)] animate-pulse" />
        </div>

        {/* User Profile Card / Login Button */}
        <div ref={profileDropdownRef} className="relative">
          {!currentUser ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-blue-600/25 to-cyan-500/25 hover:from-blue-600/40 hover:to-cyan-500/40 border border-cyan-500/40 text-white font-bold text-xs flex items-center justify-between shadow-sm hover:shadow-neon-cyan transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <User className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white">Entrar na Conta</p>
                  <p className="text-[9.5px] text-slate-400">Acessar perfil ou cadastrar</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">Login →</span>
            </button>
          ) : (
            <div>
              <button
                onClick={() => setIsProfileDropdownOpen(prev => !prev)}
                className={`w-full p-2 rounded-xl border transition-all flex items-center justify-between shadow-sm cursor-pointer ${
                  isProfileDropdownOpen
                    ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-500/20 text-white'
                    : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {currentUser?.avatarUrl ? (
                    <div className="relative shrink-0">
                      <img 
                        src={currentUser.avatarUrl} 
                        alt={currentUser.name} 
                        className="w-8 h-8 rounded-full object-cover border border-cyan-400 shadow-sm"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950"></span>
                    </div>
                  ) : (
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      userRole === 'LANDLORD' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-xs font-bold text-white leading-tight truncate">
                      {currentUser?.name || 'Usuário'}
                    </span>
                    <span className={`text-[9.5px] font-mono leading-none mt-0.5 truncate ${
                      userRole === 'LANDLORD' ? 'text-purple-400 font-semibold' : 'text-cyan-400 font-semibold'
                    }`}>
                      {userRole === 'LANDLORD' ? '🏢 Locador' : '🏠 Inquilino'}
                    </span>
                  </div>
                </div>

                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                  isProfileDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                }`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 w-full glass-panel border border-cyan-500/40 rounded-2xl bg-slate-950/98 shadow-[0_15px_50px_rgba(0,0,0,0.85)] p-2 z-50 animate-fade-in backdrop-blur-2xl">
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:text-white hover:bg-cyan-500/15 flex items-center gap-2.5 transition-all cursor-pointer"
                    >
                      <User className="w-4 h-4 text-cyan-400" />
                      <span>Meu Perfil</span>
                    </button>

                    {userRole === 'LANDLORD' ? (
                      <button
                        onClick={() => {
                          setActiveView('DASHBOARD_LOCADOR');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:text-white hover:bg-purple-500/15 flex items-center gap-2.5 transition-all cursor-pointer"
                      >
                        <Building className="w-4 h-4 text-purple-400" />
                        <span>Painel de Gestão</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveView('CENTRAL_LOCACAO');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-200 hover:text-white hover:bg-cyan-500/15 flex items-center gap-2.5 transition-all cursor-pointer"
                      >
                        <Key className="w-4 h-4 text-cyan-400" />
                        <span>Minha Locação</span>
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-800" />

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/15 flex items-center gap-2.5 transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Landlord Action */}
        {userRole === 'LANDLORD' && (
          <button
            onClick={() => setIsWizardModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-sm hover:shadow-neon-cyan transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Anunciar Imóvel</span>
          </button>
        )}

        {/* Navigation List */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              MENU PRINCIPAL
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.15)] font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-400 stroke-[2.5]' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      isActive ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Cockpit Mini Telemetry Widget in Sidebar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5 mt-4">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            LOCASH ATIVO
          </span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
          <div>
            <span className="text-slate-500 text-[10px]">Ocupação</span>
            <p className="font-bold text-white font-mono">{landlordStats.occupancyRate}%</p>
          </div>
          <div>
            <span className="text-slate-500 text-[10px]">Total Imóveis</span>
            <p className="font-bold text-cyan-400 font-mono">{landlordStats.totalProperties}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
