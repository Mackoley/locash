import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { 
  MessageSquare, 
  Send, 
  DollarSign, 
  FileText, 
  Wrench, 
  Bot, 
  User, 
  Sparkles 
} from 'lucide-react';

export const LeaseChatTab: React.FC = () => {
  const { chatMessages, sendChatMessage, activeLease, userRole } = useApp();
  const [inputText, setInputText] = useState('');
  const [activeCategory, setActiveCategory] = useState<'TODOS' | 'CONVERSA' | 'FINANCEIRO' | 'CONTRATO' | 'MANUTENÇÃO'>('TODOS');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredMessages = chatMessages.filter(msg => {
    if (activeCategory === 'TODOS') return true;
    return msg.tabCategory === activeCategory;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText, activeCategory === 'TODOS' ? 'CONVERSA' : activeCategory);
    setInputText('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <GlassCard className="flex flex-col h-[600px] overflow-hidden border-slate-800">
      {/* Chat Header with Topic Filters (PRD #27) */}
      <div className="p-4 border-b border-slate-800 glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan shadow-neon-cyan">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>CANAL DA LOCAÇÃO: {activeLease.propertyTitle}</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Locador: <b>{activeLease.landlordName}</b> ⟷ Locatário: <b>{activeLease.tenantName}</b>
            </p>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-mono">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'CONVERSA', label: '💬 Chat' },
            { id: 'FINANCEIRO', label: '💰 Finanças' },
            { id: 'MANUTENÇÃO', label: '🔧 Reparos' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1 rounded-xl border text-[11px] font-bold transition-all ${
                activeCategory === tab.id
                  ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-xs no-scrollbar">
        {filteredMessages.map((msg) => {
          const isMe = (userRole === 'LANDLORD' && msg.senderRole === 'LANDLORD') ||
                       (userRole === 'TENANT' && msg.senderRole === 'TENANT');
          const isSystem = msg.senderRole === 'ADMIN' || msg.senderId === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="max-w-md bg-slate-900/90 border border-cyber-cyan/30 rounded-2xl p-3 text-center text-slate-300 text-[11px] shadow-sm">
                  <div className="flex items-center justify-center gap-1.5 text-cyber-cyan font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Notificação do Sistema</span>
                  </div>
                  {msg.message}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyber-cyan shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-md rounded-2xl p-3.5 space-y-1 ${
                  isMe
                    ? 'bg-gradient-to-r from-blue-600/30 to-cyber-cyan/25 border border-cyan-500/40 text-white shadow-neon-cyan'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400">
                  <span className="font-bold text-cyber-cyan">{msg.senderName}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs leading-relaxed">{msg.message}</p>
              </div>

              {isMe && (
                <div className="w-8 h-8 rounded-full bg-cyber-cyan/20 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3.5 border-t border-slate-800 glass-panel flex gap-2">
        <input
          type="text"
          placeholder="Digite sua mensagem vinculada ao contrato..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-xl px-4 py-2.5 focus:border-cyber-cyan focus:outline-none"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-neon-cyan transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </GlassCard>
  );
};
