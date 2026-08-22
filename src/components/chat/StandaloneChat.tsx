import React from 'react';
import { LeaseChatTab } from '../lease/LeaseChatTab';
import { MessageSquare } from 'lucide-react';

export const StandaloneChat: React.FC = () => {
  return (
    <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto max-w-5xl mx-auto w-full no-scrollbar pb-20 md:pb-8">
      <div className="glass-panel p-4 rounded-3xl border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-cyber-cyan" />
          <div>
            <h1 className="text-lg font-bold text-white font-mono">
              CENTRAL DE MENSAGENS & COMUNICAÇÃO
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              Canal criptografado de negociação e acompanhamento contratual
            </p>
          </div>
        </div>
      </div>

      <LeaseChatTab />
    </div>
  );
};
