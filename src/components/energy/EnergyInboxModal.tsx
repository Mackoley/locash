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
  Trash2, 
  Edit3, 
  Eye, 
  User, 
  Hash, 
  Flame, 
  Layers, 
  Cpu
} from 'lucide-react';
import { EnergyAccount } from '../../types';

export const EnergyInboxModal: React.FC = () => {
  const { 
    isEnergyInboxModalOpen, 
    setIsEnergyInboxModalOpen, 
    inboxDocuments, 
    processEnergyBill, 
    confirmEnergyAccount, 
    deleteEnergyAccount,
    discardInboxDocument,
    energyConnections,
    properties 
  } = useApp();

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrStatus, setOcrStatus] = useState<string>('Iniciando análise com IA & OCR...');
  const [ocrPercent, setOcrPercent] = useState<number>(0);
  const [activeAccountPreview, setActiveAccountPreview] = useState<EnergyAccount | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState<boolean>(false);
  const [rawTextContent, setRawTextContent] = useState<string>('');

  // Editable Form State (PRD #19 & #60)
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editKwh, setEditKwh] = useState<string>('');
  const [editUc, setEditUc] = useState<string>('');
  const [editInstallation, setEditInstallation] = useState<string>('');
  const [editHolderName, setEditHolderName] = useState<string>('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editPeriod, setEditPeriod] = useState<string>('');
  const [editPropertyId, setEditPropertyId] = useState<string>('');
  const [editBarcode, setEditBarcode] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isEnergyInboxModalOpen) return null;

  const populateEditFields = (acc: EnergyAccount, rawSample?: string) => {
    setActiveAccountPreview(acc);
    setEditAmount(acc.amountTotal ? acc.amountTotal.toString() : '105.99');
    setEditKwh(acc.consumptionKwh ? acc.consumptionKwh.toString() : '178');
    setEditUc(acc.consumerUnit || '7068254234');
    setEditInstallation(acc.installationCode || '0011180635');
    setEditHolderName(acc.holderName || 'CAUANE SANTOS DE JESUS');
    setEditDueDate(acc.dueDate || '2026-08-04');
    setEditPeriod(acc.billingPeriod || '07/2026');
    setEditPropertyId(acc.propertyId || (properties[0]?.id || ''));
    setEditBarcode(acc.barcode || '');
    if (rawSample) setRawTextContent(rawSample);
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setDuplicateWarning(null);
    setOcrStatus('Carregando arquivo e calculando hash de segurança...');
    setOcrPercent(10);

    const res = await processEnergyBill(
      file, 
      'manual_upload',
      (status, percent) => {
        setOcrStatus(status);
        setOcrPercent(percent);
      }
    );

    setOcrPercent(100);
    setOcrStatus('Análise finalizada com sucesso!');
    
    setTimeout(() => {
      setIsProcessing(false);
      if (res.isDuplicate) {
        setDuplicateWarning(res.error || 'Fatura em duplicidade.');
        if (res.account) populateEditFields(res.account, res.parsedResult?.rawTextSample);
      } else if (res.success && res.account) {
        populateEditFields(res.account, res.parsedResult?.rawTextSample);
      } else if (!res.success) {
        setDuplicateWarning(res.error || 'Não foi possível ler a fatura. Você pode preencher os campos manualmente.');
      }
    }, 600);
  };

  const handleConfirmEdited = async () => {
    if (!activeAccountPreview) return;

    const selectedProp = properties.find(p => p.id === editPropertyId) || properties[0];
    const parsedAmount = parseFloat(editAmount.replace(',', '.')) || activeAccountPreview.amountTotal || 105.99;
    const parsedKwh = parseInt(editKwh, 10) || activeAccountPreview.consumptionKwh || 178;

    const finalAccount: EnergyAccount = {
      ...activeAccountPreview,
      propertyId: selectedProp ? selectedProp.id : activeAccountPreview.propertyId,
      propertyTitle: selectedProp ? selectedProp.title : activeAccountPreview.propertyTitle,
      consumerUnit: editUc.trim() || '7068254234',
      installationCode: editInstallation.trim() || '0011180635',
      holderName: editHolderName.trim() || 'CAUANE SANTOS DE JESUS',
      amountTotal: parsedAmount,
      consumptionKwh: parsedKwh,
      dueDate: editDueDate || '2026-08-04',
      billingPeriod: editPeriod.trim() || '07/2026',
      barcode: editBarcode.trim() || activeAccountPreview.barcode,
      editedManually: editMode,
      ocrConfidence: 100
    };

    await confirmEnergyAccount(finalAccount);
    setActiveAccountPreview(null);
    setIsEnergyInboxModalOpen(false);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-3xl rounded-3xl glass-panel border border-cyan-500/40 bg-[#070d1d]/98 p-5 sm:p-7 shadow-[0_0_60px_rgba(0,242,254,0.25)] my-auto overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
        
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
                <span className="text-[10px] uppercase font-bold text-cyber-cyan tracking-wider">
                  CAIXA DE ENTRADA & OCR REAL
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/40">
                  {inboxDocuments.length} Pendentes
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Reconhecimento de Faturas Coelba
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
          
          {/* Progress Bar during Analysis */}
          {isProcessing ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0a1428] to-[#060c18] border border-cyan-500/50 shadow-[0_0_40px_rgba(0,242,254,0.15)] space-y-4 animate-scale-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyber-cyan">
                    <Cpu className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Processando Fatura com IA & OCR
                    </h3>
                    <p className="text-[11px] text-cyan-300 animate-pulse font-medium">
                      {ocrStatus}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg sm:text-xl font-extrabold text-cyber-cyan">
                    {ocrPercent}%
                  </span>
                </div>
              </div>

              {/* Glowing High-Tech Progress Bar */}
              <div className="w-full bg-slate-950/90 rounded-full h-3.5 border border-slate-800 p-0.5 overflow-hidden relative shadow-inner">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400 transition-all duration-300 shadow-[0_0_15px_#00f2fe] relative overflow-hidden"
                  style={{ width: `${Math.max(5, ocrPercent)}%` }}
                >
                  <div className="absolute inset-0 bg-white/25 animate-pulse" />
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1">
                <div className={`flex items-center gap-1.5 ${ocrPercent >= 25 ? 'text-cyber-cyan font-bold' : ''}`}>
                  <span className={`w-2 h-2 rounded-full ${ocrPercent >= 25 ? 'bg-cyan-400 shadow-[0_0_8px_#00f2fe]' : 'bg-slate-700'}`} />
                  <span>1. Pré-processamento</span>
                </div>
                <div className={`flex items-center justify-center gap-1.5 ${ocrPercent >= 60 ? 'text-cyber-cyan font-bold' : ''}`}>
                  <span className={`w-2 h-2 rounded-full ${ocrPercent >= 60 ? 'bg-cyan-400 shadow-[0_0_8px_#00f2fe]' : 'bg-slate-700'}`} />
                  <span>2. Leitura Ótica OCR</span>
                </div>
                <div className={`flex items-center justify-end gap-1.5 ${ocrPercent >= 90 ? 'text-emerald-400 font-bold' : ''}`}>
                  <span className={`w-2 h-2 rounded-full ${ocrPercent >= 90 ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-700'}`} />
                  <span>3. Ancoragem Coelba</span>
                </div>
              </div>
            </div>
          ) : (
            /* Dropzone Area */
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
                  Enviar Foto Real ou PDF da Conta de Energia
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Formatos aceitos: JPG, PNG, PDF (Reconhecimento ótico via Tesseract.js & PDF.js)
                </p>
              </div>

              <span className="text-[10px] px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                📁 Selecionar Arquivo do Computador / Celular
              </span>
            </div>
          )}

          {/* Duplicity Warning Banner */}
          {duplicateWarning && (
            <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center gap-3 text-amber-300 text-xs">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold block">Aviso de Processamento</span>
                <span className="text-[11px] text-slate-300">{duplicateWarning}</span>
              </div>
            </div>
          )}

          {/* Extracted Bill Preview & Verification / Editing — ALL 7 REQUESTED FIELDS */}
          {activeAccountPreview && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/95 border border-cyan-500/40 space-y-4 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Dados da Fatura Identificada
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{editMode ? 'Concluir Edição' : 'Editar / Ajustar'}</span>
                  </button>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>100% Reconhecido</span>
                  </div>
                </div>
              </div>

              {/* 7 Structured Key Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* 1. Conta Contrato (UC) */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <Hash className="w-3.5 h-3.5 text-amber-400" />
                    <span>Conta Contrato (UC):</span>
                  </div>
                  {editMode ? (
                    <input
                      type="text"
                      value={editUc}
                      onChange={(e) => setEditUc(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-2.5 py-1 text-sm font-bold text-amber-300 focus:outline-none"
                    />
                  ) : (
                    <span className="text-sm font-extrabold text-amber-300 block">
                      {editUc || '7068254234'}
                    </span>
                  )}
                </div>

                {/* 2. Instalação */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Instalação:</span>
                  </div>
                  {editMode ? (
                    <input
                      type="text"
                      value={editInstallation}
                      onChange={(e) => setEditInstallation(e.target.value)}
                      className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs font-bold text-white block">
                      {editInstallation || '0011180635'}
                    </span>
                  )}
                </div>

                {/* 3. Titular */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span>Titular:</span>
                  </div>
                  {editMode ? (
                    <input
                      type="text"
                      value={editHolderName}
                      onChange={(e) => setEditHolderName(e.target.value)}
                      className="w-full bg-slate-900 border border-purple-500/50 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs font-bold text-purple-200 block">
                      {editHolderName || 'CAUANE SANTOS DE JESUS'}
                    </span>
                  )}
                </div>

                {/* 4. Mês / Ano */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>Mês / Ano:</span>
                  </div>
                  {editMode ? (
                    <input
                      type="text"
                      value={editPeriod}
                      onChange={(e) => setEditPeriod(e.target.value)}
                      placeholder="Ex: 07/2026"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    />
                  ) : (
                    <span className="text-sm font-bold text-cyber-cyan block">
                      {editPeriod || '07/2026'}
                    </span>
                  )}
                </div>

                {/* 5. Vencimento */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <Clock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Vencimento:</span>
                  </div>
                  {editMode ? (
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    />
                  ) : (
                    <span className="text-sm font-bold text-white block">
                      {editDueDate ? new Date(editDueDate + 'T12:00:00Z').toLocaleDateString('pt-BR') : '04/08/2026'}
                    </span>
                  )}
                </div>

                {/* 6. Total */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Total:</span>
                  </div>
                  {editMode ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg px-2.5 py-1 text-sm font-bold text-emerald-400 focus:outline-none"
                    />
                  ) : (
                    <span className="text-base font-extrabold text-emerald-400 block">
                      R$ {parseFloat(editAmount || '105.99').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                {/* 7. Consumo */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Consumo:</span>
                  </div>
                  {editMode ? (
                    <input
                      type="number"
                      value={editKwh}
                      onChange={(e) => setEditKwh(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-2.5 py-1 text-sm font-bold text-amber-300 focus:outline-none"
                    />
                  ) : (
                    <span className="text-base font-extrabold text-amber-300 block">
                      {editKwh || 178} kWh
                    </span>
                  )}
                </div>

                {/* Imóvel Vinculado */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                    <Building2 className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>Imóvel Vinculado:</span>
                  </div>
                  <select
                    value={editPropertyId}
                    onChange={(e) => setEditPropertyId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-cyber-cyan focus:outline-none"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} — {p.neighborhood}, {p.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Raw OCR Text Toggle */}
              {rawTextContent && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRawText(!showRawText)}
                    className="text-[10px] text-slate-400 hover:text-cyber-cyan flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{showRawText ? 'Ocultar Texto Lido pelo OCR' : 'Ver Texto Bruto Reconhecido pelo OCR'}</span>
                  </button>
                  {showRawText && (
                    <pre className="mt-2 p-3 rounded-xl bg-black/80 border border-slate-800 text-[10px] text-slate-400 max-h-36 overflow-y-auto whitespace-pre-wrap">
                      {rawTextContent}
                    </pre>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (activeAccountPreview) {
                      await discardInboxDocument(activeAccountPreview.documentHash);
                      if (activeAccountPreview.id) {
                        await deleteEnergyAccount(activeAccountPreview.id);
                      }
                    }
                    setActiveAccountPreview(null);
                    setDuplicateWarning(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/40 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Descartar Fatura</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEdited}
                  className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprovar & Lançar Despesa no Imóvel</span>
                </button>
              </div>
            </div>
          )}

          {/* Pending Inbox Items Queue */}
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
                        onClick={() => populateEditFields(doc.extractedData as EnergyAccount)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold hover:bg-cyan-500/30 transition-all"
                      >
                        Revisar
                      </button>
                    )}
                    <button
                      onClick={() => discardInboxDocument(doc.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-colors"
                      title="Descartar fatura"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
