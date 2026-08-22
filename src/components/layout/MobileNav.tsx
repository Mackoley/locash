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
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-cyber-darkest/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              isActive 
                ? 'text-cyber-cyan font-bold scale-105' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-cyber-cyan' : ''}`} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-cyber-cyan text-slate-950 text-[9px] font-extrabold rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-cyber-cyan shadow-neon-cyan mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
