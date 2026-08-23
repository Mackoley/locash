import React, { useState } from 'react';
import { EnergyConnection } from '../../types';
import { 
  Zap, 
  X, 
  Mail, 
  Phone, 
  Copy, 
  Check, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  ArrowUpRight, 
  ExternalLink,
  FileText,
  Trash2,
  Inbox,
  AlertCircle
} from 'lucide-react';

interface EnergyConnectionDetailModalProps {
  connection: EnergyConnection | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onOpenInbox: () => void;
}

export const EnergyConnectionDetailModal: React.FC<EnergyConnectionDetailModalProps> = ({
  connection,
  isOpen,
  onClose,
  onDelete,
  onOpenInbox
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !connection) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const inboundEmail = connection.inboxEmailAddress || `energia+${connection.consumerUnit}@inbox.locash.app`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-xl rounded-3xl glass-panel border border-cyan-500/40 bg-[#070d1d]/98 p-5 sm:p-7 shadow-[0_0_60px_rgba(0,242,254,0.25)] my-auto overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
        
        {/* Top Glowing Bar */}
        <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00f2fe]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                  DETALHES DA UNIDADE CONSUMIDORA
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {connection.status}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-[280px] sm:max-w-md">
                {connection.propertyTitle}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto space-y-4 no-scrollbar pr-1 flex-1 text-xs">
          
          {/* Main Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* UC Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Conta Contrato / UC</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-amber-300">{connection.consumerUnit}</span>
                <button
                  onClick={() => copyToClipboard(connection.consumerUnit, 'uc')}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copiar UC"
                >
                  {copiedField === 'uc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Concessionária Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Distribuidora</span>
              <span className="text-sm font-extrabold text-white block">{connection.providerName}</span>
            </div>

            {/* Titular Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 sm:col-span-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Titular Cadastrado</span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{connection.holderName}</span>
                {connection.holderDocumentMasked && (
                  <span className="text-[11px] text-slate-400 font-mono">CPF: {connection.holderDocumentMasked}</span>
                )}
              </div>
            </div>
          </div>

          {/* DEDICATED INBOUND REDIRECTION EMAIL SECTION */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0a152d] to-[#060c1c] border border-cyan-500/50 shadow-[0_0_30px_rgba(0,242,254,0.15)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyber-cyan">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    E-mail de Redirecionamento Automático
                  </h4>
                  <span className="text-[10px] text-cyan-300">Caixa de Entrada Inteligente da UC</span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-extrabold border border-cyan-500/40 animate-pulse">
                RECEPTOR ATIVO
              </span>
            </div>

            {/* Copy Email Box */}
            <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/30 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-cyber-cyan break-all select-all font-mono">
                {inboundEmail}
              </span>
              <button
                onClick={() => copyToClipboard(inboundEmail, 'email')}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
              >
                {copiedField === 'email' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar E-mail</span>
                  </>
                )}
              </button>
            </div>

            {/* How to use Guide */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Como ativar a automação com este e-mail:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 text-[10px]">
                <li><strong className="text-slate-200">Na Coelba:</strong> Cadastre este e-mail para envio da Fatura Digital na agência virtual da concessionária.</li>
                <li><strong className="text-slate-200">No seu Gmail/Outlook:</strong> Crie uma regra para encaminhar automaticamente faturas da Coelba para este endereço.</li>
                <li><strong className="text-slate-200">Resultado:</strong> Toda fatura enviada para este e-mail é lida pela IA e vinculada a este imóvel na hora!</li>
              </ul>
            </div>
          </div>

          {/* Automações & Status */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Automações Ativas</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Recepção E-mail: <strong>Ativo</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>WhatsApp Bot: <strong>Ativo</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 col-span-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Lançamento Contábil: <strong>{connection.automaticRegistration ? 'Automático (IA ≥ 95%)' : 'Manual com Aprovação'}</strong></span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Deseja remover o vínculo da UC ${connection.consumerUnit}?`)) {
                onDelete(connection.id);
                onClose();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir UC</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenInbox();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyber-cyan border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Enviar Fatura Agora</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
