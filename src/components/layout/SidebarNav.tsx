import React from 'react';
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
  ShieldCheck
} from 'lucide-react';

export const SidebarNav: React.FC = () => {
  const { 
    userRole, 
    activeView, 
    setActiveView, 
    favorites, 
    chatMessages, 
    setIsWizardModalOpen,
    landlordStats
  } = useApp();

  const tenantNavItems = [
    { id: 'MAPA', label: 'Mapa Interativo', icon: Map },
    { id: 'EXPLORAR', label: 'Explorar Lista', icon: Compass },
    { id: 'FAVORITOS', label: 'Favoritos', icon: Heart, badge: favorites.length },
    { id: 'CENTRAL_LOCACAO', label: 'Minha Locação', icon: Home, highlight: true },
    { id: 'MENSAGENS', label: 'Mensagens', icon: MessageSquare, badge: chatMessages.length }
  ];

  const landlordNavItems = [
    { id: 'DASHBOARD_LOCADOR', label: 'Cockpit Geral', icon: LayoutDashboard },
    { id: 'MAPA', label: 'Mapa de Gestão', icon: Map },
    { id: 'MEUS_IMOVEIS', label: 'Meus Imóveis', icon: Building, badge: landlordStats.totalProperties },
    { id: 'CENTRAL_LOCACAO', label: 'Central de Locações', icon: FileCheck2, highlight: true },
    { id: 'MENSAGENS', label: 'Mensagens', icon: MessageSquare, badge: chatMessages.length }
  ];

  const navItems = userRole === 'LANDLORD' ? landlordNavItems : tenantNavItems;

  return (
    <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-slate-800/80 bg-cyber-darkest/95 p-3.5 justify-between select-none shrink-0 h-full overflow-y-auto no-scrollbar">
      {/* Navigation Section */}
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              {userRole === 'LANDLORD' ? 'PAINEL DO LOCADOR' : 'NAVEGAÇÃO LOCATÁRIO'}
            </span>
            <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse shadow-neon-cyan" />
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
                      ? 'bg-gradient-to-r from-cyber-cyan/20 to-blue-600/10 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_15px_rgba(0,242,254,0.15)] font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyber-cyan stroke-[2.5]' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      isActive ? 'bg-cyber-cyan text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Landlord Action */}
        {userRole === 'LANDLORD' && (
          <div className="pt-2">
            <button
              onClick={() => setIsWizardModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyber-cyan/15 to-blue-600/15 hover:from-cyber-cyan/25 hover:to-blue-600/25 border border-cyber-cyan/40 text-cyber-cyan font-bold text-xs shadow-sm hover:shadow-neon-cyan transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Cadastro de Imóvel</span>
            </button>
          </div>
        )}
      </div>

      {/* Cockpit Mini Telemetry Widget in Sidebar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyber-emerald" />
            SISTEMA ONLINE
          </span>
          <span className="text-cyber-emerald font-bold">100% OK</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
          <div>
            <span className="text-slate-500 text-[10px]">Ocupação</span>
            <p className="font-bold text-white font-mono">{landlordStats.occupancyRate}%</p>
          </div>
          <div>
            <span className="text-slate-500 text-[10px]">Total Imóveis</span>
            <p className="font-bold text-cyber-cyan font-mono">{landlordStats.totalProperties}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
