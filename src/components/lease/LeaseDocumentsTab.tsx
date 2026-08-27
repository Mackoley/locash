import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentType } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { FileText, Download, Upload, Eye, CheckCircle2, ShieldCheck, Plus } from 'lucide-react';

export const LeaseDocumentsTab: React.FC = () => {
  const { documents, addDocument } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('OUTROS');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    addDocument({
      fileName: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`,
      fileSize: '1.2 MB',
      documentType
    });

    setFileName('');
    setIsModalOpen(false);
    alert('📁 Documento anexado com sucesso à Central da Locação!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800/80 bg-[#091022]/80 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyber-cyan border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.15)] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Repositório de Documentos e Vistorias
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Armazenamento seguro, contratos assinados e laudos de vistoria de entrada e saída
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs font-mono shadow-[0_0_20px_rgba(0,242,254,0.35)] transition-all transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Anexar Novo Documento</span>
        </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <GlassCard key={doc.id} glow="none" className="p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/15 text-cyber-cyan border border-cyber-cyan/30 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-bold uppercase text-cyber-cyan bg-cyan-500/10 px-2 py-0.5 rounded border border-cyber-cyan/30">
                  {doc.documentType}
                </span>
                <h4 className="text-xs font-bold text-white font-mono truncate mt-1.5" title={doc.fileName}>
                  {doc.fileName}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Tamanho: <b>{doc.fileSize}</b> • Por: {doc.uploadedByName}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500 font-mono">
                {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Visualizando documento ${doc.fileName}...`)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                  title="Visualizar"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => alert(`Download de ${doc.fileName} concluído!`)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Baixar</span>
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Upload Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <form 
            onSubmit={handleUpload}
            className="w-full max-w-md bg-cyber-darkest border border-cyan-500/40 rounded-3xl p-6 shadow-neon-cyan space-y-4 font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyber-cyan" />
                Anexar Documento da Locação
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 block font-bold">Tipo do Documento</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyber-cyan focus:outline-none"
              >
                <option value="CONTRATO">Contrato de Locação Assinado</option>
                <option value="VISTORIA_ENTRADA">Laudo de Vistoria de Entrada</option>
                <option value="VISTORIA_SAIDA">Laudo de Vistoria de Saída</option>
                <option value="COMPROVANTE">Comprovante Financeiro</option>
                <option value="LAUDO">Laudo Técnico / ART</option>
                <option value="REGULAMENTO">Regulamento Interno</option>
                <option value="OUTROS">Outros Documentos</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 block font-bold">Nome do Arquivo</label>
              <input
                type="text"
                required
                placeholder="Ex: Laudo_Eletrico_Agosto_2026.pdf"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyber-cyan focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-cyber-cyan hover:bg-cyan-400 text-slate-950 font-extrabold shadow-neon-cyan"
              >
                Salvar Arquivo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
