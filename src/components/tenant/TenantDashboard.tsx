import React from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/Badge';
import { GlassCard } from '../ui/GlassCard';
import { StatCard } from '../ui/StatCard';
import { 
  Home, 
  DollarSign, 
  Calendar, 
  Wrench, 
  FileText, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react';

export const TenantDashboard: React.FC = () => {
  const { activeLease, payments, maintenanceRequests, setActiveView } = useApp();

  const pendingPayment = payments.find(p => p.status === 'PENDENTE');
  const openMaint = maintenanceRequests.filter(m => m.status !== 'RESOLVIDA');

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full no-scrollbar pb-20 md:pb-8">
      {/* Header */}
      <div className="glass-panel p-5 rounded-3xl border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-cyber-cyan" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
              MINHAS LOCAÇÕES
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Painel do Locatário • Gestão ativa de pagamentos, contratos e suporte
          </p>
        </div>

        <button
          onClick={() => setActiveView('MAPA')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyber-cyan border border-cyber-cyan/30 text-xs font-bold font-mono transition-all"
        >
          <Compass className="w-4 h-4" />
          <span>Explorar Mais Imóveis no Mapa</span>
        </button>
      </div>

      {/* Main Active Lease Big Card */}
      <GlassCard glow="cyan" className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge status="ACTIVE" size="md" />
              <span className="text-xs font-mono font-bold text-cyber-cyan">
                LOCAÇÃO EM VIGOR
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1.5">
              {activeLease.propertyTitle}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {activeLease.propertyAddress}
            </p>
          </div>

          <button
            onClick={() => setActiveView('CENTRAL_LOCACAO')}
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono shadow-neon-cyan transition-all"
          >
            <span>Acessar Central da Locação</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Quick Telemetry Cards for the Tenant */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 font-mono">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyber-emerald" />
              Próximo Pagamento
            </span>
            <p className="text-lg font-extrabold text-white">
              R$ {pendingPayment ? pendingPayment.amount.toLocaleString('pt-BR') : activeLease.rentAmount.toLocaleString('pt-BR')}
            </p>
            <span className="text-[11px] text-slate-400 block">
              Vence em {pendingPayment ? pendingPayment.dueDate : `dia ${activeLease.dueDay}`}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 font-mono">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyber-cyan" />
              Vigência Contratual
            </span>
            <p className="text-lg font-extrabold text-white">
              Até {activeLease.endDate}
            </p>
            <span className="text-[11px] text-slate-400 block">
              Reajuste anual ({activeLease.adjustmentIndex})
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 font-mono">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-cyber-amber" />
              Chamados Ativos
            </span>
            <p className="text-lg font-extrabold text-cyber-amber">
              {openMaint.length} em atendimento
            </p>
            <span className="text-[11px] text-slate-400 block">
              Suporte técnico disponível
            </span>
          </div>
        </div>

        {/* Shortcuts Grid (PRD #19) */}
        <div className="pt-2">
          <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider block mb-3">
            Atalhos do Imóvel:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            <button
              onClick={() => setActiveView('CENTRAL_LOCACAO')}
              className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left flex items-center gap-2.5 transition-colors group"
            >
              <DollarSign className="w-4 h-4 text-cyber-emerald group-hover:scale-110 transition-transform" />
              <span className="font-bold text-slate-200">Pagamentos</span>
            </button>

            <button
              onClick={() => setActiveView('CENTRAL_LOCACAO')}
              className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left flex items-center gap-2.5 transition-colors group"
            >
              <FileText className="w-4 h-4 text-cyber-cyan group-hover:scale-110 transition-transform" />
              <span className="font-bold text-slate-200">Meu Contrato</span>
            </button>

            <button
              onClick={() => setActiveView('CENTRAL_LOCACAO')}
              className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left flex items-center gap-2.5 transition-colors group"
            >
              <Wrench className="w-4 h-4 text-cyber-amber group-hover:scale-110 transition-transform" />
              <span className="font-bold text-slate-200">Manutenção</span>
            </button>

            <button
              onClick={() => setActiveView('MENSAGENS')}
              className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left flex items-center gap-2.5 transition-colors group"
            >
              <MessageSquare className="w-4 h-4 text-cyber-purple group-hover:scale-110 transition-transform" />
              <span className="font-bold text-slate-200">Chat Locador</span>
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
