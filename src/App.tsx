import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { SidebarNav } from './components/layout/SidebarNav';
import { MobileNav } from './components/layout/MobileNav';
import { PwaInstallPrompt } from './components/layout/PwaInstallPrompt';
import { FuturisticMap } from './components/map/FuturisticMap';
import { PropertyDetailModal } from './components/property/PropertyDetailModal';
import { PropertyFiltersModal } from './components/property/PropertyFiltersModal';
import { PropertyWizardModal } from './components/property/PropertyWizardModal';
import { PropertyEditModal } from './components/property/PropertyEditModal';
import { AuthModal } from './components/auth/AuthModal';
import { RoleOnboardingModal } from './components/auth/RoleOnboardingModal';
import { PropertyExplorerList } from './components/property/PropertyExplorerList';
import { LandlordDashboard } from './components/landlord/LandlordDashboard';
import { LandlordProperties } from './components/landlord/LandlordProperties';
import { LeaseHub } from './components/tenant/LeaseHub';
import { StandaloneChat } from './components/chat/StandaloneChat';

export const AppContent: React.FC = () => {
  const { activeView, isAuthModalOpen, setIsAuthModalOpen } = useApp();

  return (
    <div className="h-[100dvh] w-screen max-w-full bg-cyber-darkest text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Cockpit Header */}
      <Header />

      {/* Main Container with Sidebar + Dynamic Center Stage */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <SidebarNav />

        {/* Dynamic Center View */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#080d1a]">
          {activeView === 'MAPA' && <FuturisticMap />}
          {activeView === 'EXPLORAR' && <PropertyExplorerList />}
          {activeView === 'FAVORITOS' && <PropertyExplorerList onlyFavorites />}
          {activeView === 'CENTRAL_LOCACAO' && <LeaseHub />}
          {activeView === 'DASHBOARD_LOCADOR' && <LandlordDashboard />}
          {activeView === 'MEUS_IMOVEIS' && <LandlordProperties />}
          {activeView === 'MENSAGENS' && <StandaloneChat />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Modals & Slide-overs */}
      <PropertyDetailModal />
      <PropertyFiltersModal />
      <PropertyWizardModal />
      <PropertyEditModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <RoleOnboardingModal />
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
