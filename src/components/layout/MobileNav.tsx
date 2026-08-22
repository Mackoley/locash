import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Map, 
  Compass, 
  Heart, 
  Home, 
  MessageSquare, 
  LayoutDashboard, 
  Building
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { userRole, activeView, setActiveView, favorites, chatMessages, landlordStats } = useApp();

  const tenantTabs = [
    { id: 'MAPA', label: 'Mapa', icon: Map },
    { id: 'EXPLORAR', label: 'Explorar', icon: Compass },
    { id: 'FAVORITOS', label: 'Favoritos', icon: Heart, badge: favorites.length },
    { id: 'CENTRAL_LOCACAO', label: 'Locação', icon: Home },
    { id: 'MENSAGENS', label: 'Chat', icon: MessageSquare, badge: chatMessages.length }
  ];

  const landlordTabs = [
    { id: 'DASHBOARD_LOCADOR', label: 'Cockpit', icon: LayoutDashboard },
    { id: 'MAPA', label: 'Mapa', icon: Map },
    { id: 'MEUS_IMOVEIS', label: 'Imóveis', icon: Building, badge: landlordStats.totalProperties },
    { id: 'CENTRAL_LOCACAO', label: 'Locação', icon: Home },
    { id: 'MENSAGENS', label: 'Chat', icon: MessageSquare, badge: chatMessages.length }
  ];

  const tabs = userRole === 'LANDLORD' ? landlordTabs : tenantTabs;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0d1527] backdrop-blur-2xl border-t border-cyan-500/25 px-2 py-2 flex items-center justify-around shadow-[0_-8px_30px_rgba(5,10,25,0.85)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
              isActive 
                ? 'bg-gradient-to-t from-cyan-500/25 to-blue-600/15 border border-cyan-500/40 text-white shadow-[0_0_20px_rgba(0,242,254,0.3)] scale-105' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon 
                className={`w-5 h-5 transition-all ${
                  isActive 
                    ? 'text-white stroke-[2.5] drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] scale-110' 
                    : 'text-slate-300'
                }`} 
              />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-cyber-cyan text-slate-950 text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-neon-cyan animate-pulse">
                  {tab.badge}
                </span>
              )}
            </div>
            <span 
              className={`text-[11px] tracking-tight mt-1 transition-all ${
                isActive 
                  ? 'text-white font-extrabold drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
                  : 'text-slate-300 font-medium'
              }`}
            >
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan shadow-neon-cyan mt-0.5 animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
