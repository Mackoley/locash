import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

export const PwaInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Also check if already dismissed previously
    const dismissed = sessionStorage.getItem('locash_pwa_dismissed');
    if (!dismissed && !window.matchMedia('(display-mode: standalone)').matches) {
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('Para instalar no celular: toque no botão Compartilhar do navegador e selecione "Adicionar à Tela de Início" 📲');
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('locash_pwa_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-16 md:bottom-6 right-3 md:right-6 z-50 max-w-sm w-[calc(100%-24px)] md:w-auto glass-panel border border-cyan-500/40 p-3.5 rounded-2xl shadow-neon-cyan animate-float">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="LOCASH" 
            className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(0,242,254,0.4)] shrink-0" 
          />
          <div>
            <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              INSTALAR LOCASH
              <span className="text-[9px] px-1 rounded bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40">
                PWA
              </span>
            </h4>
            <p className="text-[11px] text-slate-300">
              Instale o aplicativo direto no seu celular ou computador
            </p>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-neon-cyan transition-all"
        >
          <Download className="w-3.5 h-3.5 text-white" />
          <span>Instalar Agora</span>
        </button>
        <button
          onClick={handleDismiss}
          className="py-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
        >
          Agora Não
        </button>
      </div>
    </div>
  );
};
