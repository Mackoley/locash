import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Inbox, 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Zap, 
  DollarSign, 
  Calendar, 
  Barcode, 
  QrCode, 
  Copy, 
  Check, 
  ShieldAlert,
  Clock,
  Building2,
  Trash2
} from 'lucide-react';
import { energyOcrService } from '../../services/energyOcrService';
import { EnergyAccount } from '../../types';

export const EnergyInboxModal: React.FC = () => {
  const { 
    isEnergyInboxModalOpen, 
    setIsEnergyInboxModalOpen, 
    inboxDocuments, 
    processEnergyBill, 
    confirmEnergyAccount, 
    energyConnections,
    properties 
  } = useApp();

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeAccountPreview, setActiveAccountPreview] = useState<EnergyAccount | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isEnergyInboxModalOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setDuplicateWarning(null);

    const res = await processEnergyBill(file, 'manual_upload');
    setIsProcessing(false);

    if (res.isDuplicate) {
      setDuplicateWarning(res.error || 'Fatura em duplicidade.');
      if (res.account) setActiveAccountPreview(res.account);
    } else if (res.success && res.account) {
      setActiveAccountPreview(res.account);
    }
  };

  const handleSimulateDemoBill = async () => {
    setIsProcessing(true);
    setDuplicateWarning(null);

    // Create a mock File object
    const mockFile = new File(['NEOENERGIA COELBA FATURA DEMO'], 'fatura-coelba-agosto-2026.pdf', { type: 'application/pdf' });
    const res = await processEnergyBill(mockFile, 'email');
    setIsProcessing(false);

    if (res.isDuplicate) {
      setDuplicateWarning(res.error || 'Fatura em duplicidade.');
      if (res.account) setActiveAccountPreview(res.account);
    } else if (res.success && res.account) {
      setActiveAccountPreview(res.account);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl glass-panel border border-cyan-500/40 bg-[#070d1d]/98 p-5 sm:p-7 shadow-[0_0_60px_rgba(0,242,254,0.25)] my-auto overflow-hidden animate-scale-up max-h-[90vh] flex flex-col font-mono">
        
        {/* Top Glowing Bar */}
        <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00f2fe]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyber-cyan shadow-md">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold text-cyber-cyan tracking-wider">
                  CAIXA DE ENTRADA INTELIGENTE
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/40">
                  {inboxDocuments.length} Pendentes
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-mono">
                Recebimento & OCR de Faturas (Coelba)
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsEnergyInboxModalOpen(false)}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto space-y-4 no-scrollbar pr-1 flex-1">
          {/* Dropzone Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
              isDragging
                ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_30px_rgba(0,242,254,0.2)]'
                : 'border-slate-800 bg-slate-900/50 hover:border-cyan-500/40 hover:bg-slate-900/80'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyber-cyan">
              <Upload className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <p className="text-xs font-bold text-white">
                Arraste o PDF ou foto da conta de energia aqui
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Formatos aceitos: PDF, JPG, PNG (Leitura automática de UC, kWh, Valor e Vencimento)
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                📁 Selecionar Arquivo
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSimulateDemoBill();
                }}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Simular Envio Coelba</span>
              </button>
            </div>
          </div>

          {/* Processing Animation */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 flex items-center gap-3 animate-pulse">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">Processando Fatura com IA & OCR Coelba...</p>
                <p className="text-[10px] text-slate-400">Identificando UC, extraindo consumo kWh, valores e validando hash de segurança.</p>
              </div>
            </div>
          )}

          {/* Duplicity Warning Banner (PRD #20) */}
          {duplicateWarning && (
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center gap-3 text-amber-300 text-xs">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold block">Fatura Já Registrada (Anti-Duplicidade Ativo)</span>
                <span className="text-[11px] text-slate-300">{duplicateWarning}</span>
              </div>
            </div>
          )}

          {/* Extracted Bill Preview & Verification */}
          {activeAccountPreview && (
            <div className="p-4 rounded-2xl bg-slate-900/95 border border-cyan-500/40 space-y-4 animate-scale-up">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span className="text-xs font-bold text-white">Dados Extraídos da Fatura</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confiança IA: {activeAccountPreview.ocrConfidence}%</span>
                </div>
              </div>

              {/* 4 Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Total a Pagar</span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    R$ {activeAccountPreview.amountTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Consumo</span>
                  <span className="text-sm font-extrabold text-amber-300">
                    {activeAccountPreview.consumptionKwh} kWh
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Vencimento</span>
                  <span className="text-sm font-bold text-white">
                    {new Date(activeAccountPreview.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Competência</span>
                  <span className="text-sm font-bold text-cyber-cyan">
                    {activeAccountPreview.billingPeriod}
                  </span>
                </div>
              </div>

              {/* UC and Property Binding Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Unidade Consumidora:</span>
                  <span className="font-bold text-white">{activeAccountPreview.consumerUnit}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-400">Imóvel Vinculado:</span>
                  <span className="font-bold text-cyber-cyan truncate max-w-[150px]">{activeAccountPreview.propertyTitle}</span>
                </div>
              </div>

              {/* Barcode / Pix Copia e Cola */}
              {activeAccountPreview.barcode && (
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Barcode className="w-3.5 h-3.5" />
                      Linha Digitável / Código de Barras
                    </span>
                    <button
                      onClick={() => copyToClipboard(activeAccountPreview.barcode!, 'barcode')}
                      className="text-cyber-cyan hover:underline flex items-center gap-0.5"
                    >
                      {copiedField === 'barcode' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'barcode' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <code className="text-[10px] text-slate-200 block truncate select-all">
                    {activeAccountPreview.barcode}
                  </code>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAccountPreview(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await confirmEnergyAccount(activeAccountPreview);
                    setActiveAccountPreview(null);
                    setIsEnergyInboxModalOpen(false);
                  }}
                  className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprovar & Lançar Despesa Financeira</span>
                </button>
              </div>
            </div>
          )}

          {/* Pending Inbox Items Queue (PRD #37) */}
          {inboxDocuments.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-300 block">
                Faturas Pendentes de Revisão ({inboxDocuments.length})
              </span>

              {inboxDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{doc.fileName}</p>
                      <p className="text-[10px] text-slate-400">
                        Via {doc.channel === 'email' ? 'E-mail' : doc.channel === 'whatsapp' ? 'WhatsApp' : 'Upload'} • {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {doc.extractedData && (
                      <button
                        onClick={() => setActiveAccountPreview(doc.extractedData as EnergyAccount)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold hover:bg-cyan-500/30 transition-all"
                      >
                        Revisar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
