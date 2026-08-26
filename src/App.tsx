import React from 'react';
import { useApp } from './context/AppContext';
import { SidebarNav } from './components/layout/SidebarNav';
import { MobileNav } from './components/layout/MobileNav';
import { FloatingSearchBar } from './components/layout/FloatingSearchBar';
import { PwaInstallPrompt } from './components/layout/PwaInstallPrompt';
import { FuturisticMap } from './components/map/FuturisticMap';
import { PropertyDetailModal } from './components/property/PropertyDetailModal';
import { PropertyFiltersModal } from './components/property/PropertyFiltersModal';
import { PropertyWizardModal } from './components/property/PropertyWizardModal';
import { PropertyEditModal } from './components/property/PropertyEditModal';
import { AuthModal } from './components/auth/AuthModal';
import { RoleOnboardingModal } from './components/auth/RoleOnboardingModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { PropertyExplorerList } from './components/property/PropertyExplorerList';
import { LandlordDashboard } from './components/landlord/LandlordDashboard';
import { LandlordProperties } from './components/landlord/LandlordProperties';
import { LeaseHub } from './components/tenant/LeaseHub';
import { StandaloneChat } from './components/chat/StandaloneChat';
import { EnergyDashboardView } from './components/energy/EnergyDashboardView';
import { EnergyConnectionModal } from './components/energy/EnergyConnectionModal';
import { EnergyInboxModal } from './components/energy/EnergyInboxModal';

export const AppContent: React.FC = () => {
  const { activeView, isAuthModalOpen, setIsAuthModalOpen } = useApp();

  return (
    <div className="h-[100dvh] w-screen max-w-full bg-cyber-darkest text-slate-100 flex overflow-hidden select-none relative">
      {/* Desktop Sidebar (Full-height from top to bottom) */}
      <SidebarNav />

      {/* Dynamic Center View (Takes 100% full height & width) */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#080d1a]">
        {/* Floating Glass Search Bar (Top-Center over the map) */}
        <FloatingSearchBar />

        {activeView === 'MAPA' && <FuturisticMap />}
        {activeView === 'EXPLORAR' && <PropertyExplorerList />}
        {activeView === 'FAVORITOS' && <PropertyExplorerList onlyFavorites />}
        {activeView === 'CENTRAL_LOCACAO' && <LeaseHub />}
        {activeView === 'DASHBOARD_LOCADOR' && <LandlordDashboard />}
        {activeView === 'MEUS_IMOVEIS' && <LandlordProperties />}
        {activeView === 'ENERGIA' && <EnergyDashboardView />}
        {activeView === 'MENSAGENS' && <StandaloneChat />}
      </main>

      {/* Mobile Bottom Navigation Bar with Profile Tab */}
      <MobileNav />

      {/* Modals & Slide-overs */}
      <PropertyDetailModal />
      <PropertyFiltersModal />
      <PropertyWizardModal />
      <PropertyEditModal />
      <EnergyConnectionModal />
      <EnergyInboxModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <RoleOnboardingModal />
      <UserProfileModal />
      <PwaInstallPrompt />
    </div>
  );
};

import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
