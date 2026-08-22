import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { GlassCard } from '../ui/GlassCard';
import { 
  Wrench, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Camera, 
  Zap, 
  Droplet, 
  Hammer, 
  Paintbrush, 
  Shield 
} from 'lucide-react';

const CATEGORIES: MaintenanceCategory[] = [
  'HIDRÁULICA',
  'ELÉTRICA',
  'ESTRUTURA',
  'PINTURA',
  'PORTAS_JANELAS',
  'INTERNET',
  'SEGURANÇA',
  'OUTROS'
];

const STATUS_STEPS: MaintenanceStatus[] = [
  'ABERTA',
  'EM ANÁLISE',
  'APROVADA',
  'EM ANDAMENTO',
  'RESOLVIDA'
];

export const LeaseMaintenanceTab: React.FC = () => {
  const { 
    maintenanceRequests, 
    createMaintenanceRequest, 
    updateMaintenanceStatus, 
    userRole 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MaintenanceCategory>('HIDRÁULICA');
  const [priority, setPriority] = useState<MaintenancePriority>('MÉDIA');
  const [photoUrl, setPhotoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMaintenanceRequest({
      title,
      description,
      category,
      priority,
      photos: photoUrl ? [photoUrl] : []
    });

    setTitle('');
    setDescription('');
    setPhotoUrl('');
    setIsModalOpen(false);
    alert('🔧 Chamado de manutenção aberto com sucesso! O proprietário e os prestadores foram acionados.');
  };

  const getCategoryIcon = (cat: MaintenanceCategory) => {
    switch (cat) {
      case 'ELÉTRICA': return <Zap className="w-4 h-4 text-cyber-amber" />;
      case 'HIDRÁULICA': return <Droplet className="w-4 h-4 text-cyber-cyan" />;
      case 'ESTRUTURA': return <Hammer className="w-4 h-4 text-slate-300" />;
      case 'PINTURA': return <Paintbrush className="w-4 h-4 text-cyber-purple" />;
      case 'SEGURANÇA': return <Shield className="w-4 h-4 text-cyber-emerald" />;
      default: return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-cyber-cyan" />
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
              Chamados de Manutenção e Reparos
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Histórico completo e acompanhamento em tempo real das solicitações
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-neon-cyan transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Abrir Nova Solicitação</span>
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {maintenanceRequests.map((req) => {
          const currentStepIndex = STATUS_STEPS.indexOf(req.status);

          return (
            <GlassCard key={req.id} glow={req.status === 'RESOLVIDA' ? 'emerald' : 'amber'} className="p-5 space-y-4">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    {getCategoryIcon(req.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-cyber-cyan bg-cyan-500/10 px-2 py-0.5 rounded border border-cyber-cyan/30">
                        {req.category}
                      </span>
                      <Badge status={req.priority} size="sm" />
                      <Badge status={req.status} size="sm" />
                    </div>
                    <h4 className="text-sm font-bold text-white mt-1">{req.title}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Solicitado por <b>{req.tenantName}</b> em {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {req.cost && (
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-500">Custo Total</span>
                    <p className="text-sm font-bold text-cyber-emerald">R$ {req.cost.toLocaleString('pt-BR')}</p>
                    {req.contractorName && (
                      <span className="text-[10px] text-slate-400 block">{req.contractorName}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Description & Photo */}
              <div className="text-xs text-slate-300 space-y-2">
                <p className="leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
                  {req.description}
                </p>
                {req.photos && req.photos.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    {req.photos.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt="Evidência"
                        className="w-20 h-20 rounded-xl object-cover border border-slate-800"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 5-Step Visual Timeline (PRD #25) */}
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2 block">
                  Linha de Progresso do Reparo:
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[10px]">
                  {STATUS_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div
                        key={step}
                        className={`p-2 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold shadow-neon-cyan'
                            : isDone
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-cyber-emerald font-semibold'
                            : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
                        }`}
                      >
                        <div className="flex justify-center mb-1">
                          {isDone ? (
                            <CheckCircle2 className="w-3 h-3 text-cyber-emerald" />
                          ) : (
                            <Clock className="w-3 h-3 text-slate-600" />
                          )}
                        </div>
                        <span className="truncate block">{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Update Control for Landlord / Admin */}
              {userRole === 'LANDLORD' && req.status !== 'RESOLVIDA' && (
                <div className="pt-2 flex items-center justify-end gap-2 text-xs font-mono">
                  <span className="text-slate-500 text-[11px]">Avançar status:</span>
                  {STATUS_STEPS.map((step) => (
                    <button
                      key={step}
                      onClick={() => updateMaintenanceStatus(req.id, step)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        req.status === step
                          ? 'bg-cyber-cyan text-slate-950 border-cyber-cyan'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {step}
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* New Maintenance Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <form 
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-cyber-darkest border border-cyan-500/40 rounded-3xl p-6 shadow-neon-cyan space-y-4 font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyber-cyan" />
                Nova Solicitação de Manutenção
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-slate-400 block font-bold">Categoria do Reparo</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      category === cat
                        ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold shadow-neon-cyan'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-slate-400 block font-bold">Nível de Urgência / Prioridade</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['BAIXA', 'MÉDIA', 'ALTA', 'URGENTE'] as MaintenancePriority[]).map(pri => (
                  <button
                    type="button"
                    key={pri}
                    onClick={() => setPriority(pri)}
                    className={`py-1.5 rounded-xl border text-center font-bold transition-all ${
                      priority === pri
                        ? 'bg-amber-500/20 border-amber-500 text-cyber-amber shadow-neon-amber'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {pri}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-slate-400 block font-bold">Título Resumido</label>
              <input
                type="text"
                required
                placeholder="Ex: Vazamento de água na torneira da cozinha"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyber-cyan focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-slate-400 block font-bold">Descrição Detalhada do Problema</label>
              <textarea
                rows={3}
                required
                placeholder="Explique o que aconteceu, quando começou e detalhes adicionais..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-cyber-cyan focus:outline-none"
              />
            </div>

            {/* Photo URL */}
            <div className="space-y-1">
              <label className="text-slate-400 block font-bold">Foto / Evidência (URL)</label>
              <input
                type="text"
                placeholder="https://exemplo.com/foto-do-reparo.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
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
                Enviar Chamado
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
