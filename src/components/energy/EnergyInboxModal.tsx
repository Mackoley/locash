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
  CheckSquare
} from 'lucide-react';
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
  const [ocrStatus, setOcrStatus] = useState<string>('Processando fatura com IA & OCR...');
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
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editPeriod, setEditPeriod] = useState<string>('');
  const [editPropertyId, setEditPropertyId] = useState<string>('');
  const [editBarcode, setEditBarcode] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isEnergyInboxModalOpen) return null;

  const populateEditFields = (acc: EnergyAccount, rawSample?: string) => {
    setActiveAccountPreview(acc);
    setEditAmount(acc.amountTotal ? acc.amountTotal.toString() : '');
    setEditKwh(acc.consumptionKwh ? acc.consumptionKwh.toString() : '');
    setEditUc(acc.consumerUnit || '');
    setEditDueDate(acc.dueDate || '');
    setEditPeriod(acc.billingPeriod || '');
    setEditPropertyId(acc.propertyId || (properties[0]?.id || ''));
    setEditBarcode(acc.barcode || '');
    if (rawSample) setRawTextContent(rawSample);
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setDuplicateWarning(null);
    setOcrStatus('Iniciando reconhecimento ótico de caracteres (OCR)...');

    const res = await processEnergyBill(file, 'manual_upload');
    setIsProcessing(false);

    if (res.isDuplicate) {
      setDuplicateWarning(res.error || 'Fatura em duplicidade.');
      if (res.account) populateEditFields(res.account, res.parsedResult?.rawTextSample);
    } else if (res.success && res.account) {
      populateEditFields(res.account, res.parsedResult?.rawTextSample);
    } else if (!res.success) {
      setDuplicateWarning(res.error || 'Não foi possível ler a fatura. Você pode preencher os campos manualmente.');
    }
  };

  const handleConfirmEdited = async () => {
    if (!activeAccountPreview) return;

    const selectedProp = properties.find(p => p.id === editPropertyId) || properties[0];
    const parsedAmount = parseFloat(editAmount.replace(',', '.')) || activeAccountPreview.amountTotal || 0;
    const parsedKwh = parseInt(editKwh, 10) || activeAccountPreview.consumptionKwh || 0;

    const finalAccount: EnergyAccount = {
      ...activeAccountPreview,
      propertyId: selectedProp ? selectedProp.id : activeAccountPreview.propertyId,
      propertyTitle: selectedProp ? selectedProp.title : activeAccountPreview.propertyTitle,
      consumerUnit: editUc.trim() || activeAccountPreview.consumerUnit,
      amountTotal: parsedAmount,
      consumptionKwh: parsedKwh,
      dueDate: editDueDate || activeAccountPreview.dueDate,
      billingPeriod: editPeriod.trim() || activeAccountPreview.billingPeriod,
      barcode: editBarcode.trim() || activeAccountPreview.barcode,
      editedManually: editMode,
      ocrConfidence: editMode ? 100 : activeAccountPreview.ocrConfidence
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

          {/* Processing Animation */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 flex items-center gap-3 animate-pulse">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-white">Processando com OCR & IA...</p>
                <p className="text-[10px] text-slate-400">{ocrStatus}</p>
              </div>
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

          {/* Extracted Bill Preview & Verification / Editing */}
          {activeAccountPreview && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/95 border border-cyan-500/40 space-y-4 animate-scale-up">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span className="text-xs font-bold text-white">Dados da Fatura Identificada</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{editMode ? 'Concluir Edição' : 'Editar / Ajustar'}</span>
                  </button>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confiança: {activeAccountPreview.ocrConfidence}%</span>
                  </div>
                </div>
              </div>

              {/* Editable / Display Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Total a Pagar */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <label className="text-[10px] text-slate-400 block font-bold">Total a Pagar (R$)</label>
                  {editMode ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg px-2.5 py-1 text-sm font-bold text-emerald-400 focus:outline-none"
                    />
                  ) : (
                    <span className="text-base font-extrabold text-emerald-400 block">
                      R$ {parseFloat(editAmount || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                {/* Consumo kWh */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <label className="text-[10px] text-slate-400 block font-bold">Consumo (kWh)</label>
                  {editMode ? (
                    <input
                      type="number"
                      value={editKwh}
                      onChange={(e) => setEditKwh(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-2.5 py-1 text-sm font-bold text-amber-300 focus:outline-none"
                    />
                  ) : (
                    <span className="text-base font-extrabold text-amber-300 block">
                      {editKwh || 0} kWh
                    </span>
                  )}
                </div>

                {/* Unidade Consumidora (UC) */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <label className="text-[10px] text-slate-400 block font-bold">Conta Contrato / UC</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editUc}
                      onChange={(e) => setEditUc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs font-bold text-white block">
                      {editUc || 'Não identificada'}
                    </span>
                  )}
                </div>

                {/* Data de Vencimento */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <label className="text-[10px] text-slate-400 block font-bold">Data de Vencimento</label>
                  {editMode ? (
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs font-bold text-white block">
                      {editDueDate ? new Date(editDueDate).toLocaleDateString('pt-BR') : 'Não identificada'}
                    </span>
                  )}
                </div>

                {/* Competência */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <label className="text-[10px] text-slate-400 block font-bold">Competência (Mês/Ano)</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editPeriod}
                      onChange={(e) => setEditPeriod(e.target.value)}
                      placeholder="Ex: AGO/2026"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs font-bold text-cyber-cyan block">
                      {editPeriod || 'Agosto/2026'}
                    </span>
                  )}
                </div>

                {/* Imóvel Vinculado */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <label className="text-[10px] text-slate-400 block font-bold">Vincular ao Imóvel</label>
                  <select
                    value={editPropertyId}
                    onChange={(e) => setEditPropertyId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:border-cyber-cyan focus:outline-none"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.neighborhood})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Barcode Field */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-bold">
                    <Barcode className="w-3.5 h-3.5" />
                    Linha Digitável / Código de Barras
                  </span>
                  {editBarcode && (
                    <button
                      onClick={() => copyToClipboard(editBarcode, 'barcode')}
                      className="text-cyber-cyan hover:underline flex items-center gap-0.5"
                    >
                      {copiedField === 'barcode' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'barcode' ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  )}
                </div>
                {editMode ? (
                  <input
                    type="text"
                    value={editBarcode}
                    onChange={(e) => setEditBarcode(e.target.value)}
                    placeholder="846..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                  />
                ) : (
                  <code className="text-[10px] text-slate-300 block truncate">
                    {editBarcode || 'Não localizado na imagem'}
                  </code>
                )}
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
                  onClick={() => setActiveAccountPreview(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Descartar
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
