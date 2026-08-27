import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { StatCard } from '../ui/StatCard';
import { 
  Zap, 
  Plus, 
  UploadCloud, 
  Inbox, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Barcode, 
  Copy, 
  Check, 
  Sparkles, 
  Building2, 
  ArrowUpRight, 
  ShieldCheck, 
  FileText, 
  Trash2,
  Mail,
  Phone,
  Flame,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { EnergyAccount, EnergyConnection } from '../../types';
import { EnergyConnectionDetailModal } from './EnergyConnectionDetailModal';

export const EnergyDashboardView: React.FC = () => {
  const { 
    energyAccounts, 
    energyConnections, 
    setIsEnergyConnectionModalOpen, 
    setIsEnergyInboxModalOpen,
    deleteEnergyAccount,
    deleteEnergyConnection,
    clearEnergyData,
    properties,
    inboxDocuments
  } = useApp();

  const [timeRange, setTimeRange] = useState<'6M' | '12M' | '24M'>('6M');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('TODOS');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [selectedConnectionForDetail, setSelectedConnectionForDetail] = useState<EnergyConnection | null>(null);

  // Helper to extract a sortable number (YYYYMM) from any billingPeriod or dueDate
  const getPeriodSortKey = (periodStr?: string, dueDate?: string): number => {
    if (!periodStr && !dueDate) return 0;
    const p = (periodStr || '').toUpperCase().trim();
    
    // Format MM/YYYY or MM-YYYY
    const mmYyyy = p.match(/\b(0?[1-9]|1[0-2])[\/\-.](202[0-9]|203[0-9])\b/);
    if (mmYyyy) {
      const month = parseInt(mmYyyy[1], 10);
      const year = parseInt(mmYyyy[2], 10);
      return year * 100 + month;
    }

    // Format YYYY-MM
    const yyyyMm = p.match(/\b(202[0-9]|203[0-9])[\/\-.](0?[1-9]|1[0-2])\b/);
    if (yyyyMm) {
      const year = parseInt(yyyyMm[1], 10);
      const month = parseInt(yyyyMm[2], 10);
      return year * 100 + month;
    }

    // Month names in Portuguese (JAN, FEV, MAR, etc.)
    const monthsMap: Record<string, number> = {
      'JAN': 1, 'FEV': 2, 'MAR': 3, 'ABR': 4, 'MAI': 5, 'JUN': 6,
      'JUL': 7, 'AGO': 8, 'SET': 9, 'OUT': 10, 'NOV': 11, 'DEZ': 12
    };
    for (const [mName, mNum] of Object.entries(monthsMap)) {
      if (p.includes(mName)) {
        const yearMatch = p.match(/\b(202[0-9]|203[0-9]|[2-3][0-9])\b/);
        const year = yearMatch ? (yearMatch[1].length === 2 ? 2000 + parseInt(yearMatch[1], 10) : parseInt(yearMatch[1], 10)) : 2026;
        return year * 100 + mNum;
      }
    }

    if (dueDate) {
      const d = new Date(dueDate);
      if (!isNaN(d.getTime())) {
        return d.getFullYear() * 100 + (d.getMonth() + 1);
      }
    }

    return 202600;
  };

  // Filter accounts by property
  const filteredAccounts = energyAccounts.filter(acc => {
    if (selectedPropertyFilter === 'TODOS') return true;
    return acc.propertyId === selectedPropertyFilter;
  });

  // Strict Chronological Sorting by Reference Month (Newest month first in table, oldest to newest in charts)
  const sortedAccounts = [...filteredAccounts].sort((a, b) => 
    getPeriodSortKey(b.billingPeriod, b.dueDate) - getPeriodSortKey(a.billingPeriod, a.dueDate)
  );

  // Calculate Aggregated Metrics (PRD #25 & #28)
  const latestAccount = sortedAccounts[0];
  const totalYearlyAmount = sortedAccounts.reduce((acc, c) => acc + c.amountTotal, 0);
  const totalKwh = sortedAccounts.reduce((acc, c) => acc + c.consumptionKwh, 0);
  const avgKwh = sortedAccounts.length > 0 ? Math.round(totalKwh / sortedAccounts.length) : 0;
  const currentKwh = latestAccount ? latestAccount.consumptionKwh : 0;
  const currentAmount = latestAccount ? latestAccount.amountTotal : 0;
  const variation = latestAccount?.historyComparison?.variationPercentage ?? 0;

  // Chart data in ascending chronological order (Jan -> Dez)
  const chartData = [...sortedAccounts].reverse().map(acc => {
    const key = getPeriodSortKey(acc.billingPeriod, acc.dueDate);
    const monthNum = key % 100;
    const monthNames = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const shortLabel = monthNum >= 1 && monthNum <= 12 ? `${monthNames[monthNum]}/${String(Math.floor(key / 100)).slice(-2)}` : acc.billingPeriod;

    return {
      mes: shortLabel,
      kwh: acc.consumptionKwh,
      valor: acc.amountTotal,
      media: avgKwh
    };
  });

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClearAll = async () => {
    if (window.confirm('Deseja limpar todos os dados de faturas e UCs de energia para iniciar um teste limpo?')) {
      setIsClearing(true);
      await clearEnergyData();
      setIsClearing(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full no-scrollbar pb-24 md:pb-8 font-mono">
      {/* Header Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800/80 bg-[#091022]/80 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-cyan-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  Neoenergia Coelba
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono mt-0.5">
                GESTÃO & TELEMETRIA DE ENERGIA
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Recebimento automático de faturas Neoenergia Coelba via E-mail e WhatsApp com conciliação contábil.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {(energyAccounts.length > 0 || energyConnections.length > 0) && (
            <button
              onClick={handleClearAll}
              disabled={isClearing}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 text-xs font-bold transition-all shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.25)] cursor-pointer"
              title="Limpar todos os dados de energia"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Dados</span>
            </button>
          )}

          <button
            onClick={() => setIsEnergyInboxModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-cyan-500/50 text-xs font-bold font-mono transition-all relative cursor-pointer"
          >
            <Inbox className="w-4 h-4 text-cyan-400" />
            <span>Caixa de Entrada</span>
            {inboxDocuments.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[9px] font-extrabold flex items-center justify-center shadow">
                {inboxDocuments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsEnergyConnectionModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black font-mono shadow-[0_0_20px_rgba(0,242,254,0.35)] transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Cadastrar UC</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards (PRD #25) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Conta Atual (Coelba)"
          value={`R$ ${currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle={`Competência ${latestAccount?.billingPeriod || 'Agosto/2026'}`}
          accentColor="amber"
          icon={<Zap className="w-5 h-5 text-amber-300" />}
          trend={{ value: `${variation > 0 ? `+${variation}%` : `${variation}%`} vs média`, isPositive: variation <= 0 }}
        />

        <StatCard
          title="Consumo do Mês"
          value={`${currentKwh} kWh`}
          subtitle={`Média histórica: ${avgKwh} kWh`}
          accentColor="cyan"
          icon={<Flame className="w-5 h-5 text-cyber-cyan" />}
          trend={{ value: `${currentKwh - avgKwh} kWh diferença`, isPositive: currentKwh <= avgKwh }}
        />

        <StatCard
          title="Custo Anual Acumulado"
          value={`R$ ${totalYearlyAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle={`${filteredAccounts.length} faturas processadas`}
          accentColor="emerald"
          icon={<Calendar className="w-5 h-5 text-emerald-400" />}
        />

        <StatCard
          title="Impacto no Aluguel"
          value={`${properties.length > 0 ? ((currentAmount / (properties[0].rentPrice || 2500)) * 100).toFixed(1) : '8.7'}%`}
          subtitle="Representatividade operacional"
          accentColor="purple"
          icon={<Building2 className="w-5 h-5 text-purple-300" />}
        />
      </div>

      {/* Proactive Anomaly Alert Box (PRD #29 & #34) */}
      {variation >= 25 ? (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/50 flex items-start gap-3 text-red-200 text-xs shadow-lg">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white text-sm">Alerta de Anomalia de Consumo (+{variation}%)</span>
            <p className="text-slate-300">
              O consumo de energia no imóvel <b>{latestAccount?.propertyTitle}</b> aumentou <b>{variation}%</b> acima da média histórica dos últimos 6 meses ({avgKwh} kWh).
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyber-cyan shrink-0" />
            <span className="text-slate-300">
              <b>Insight do Locash:</b> O consumo de energia está estável e dentro da média operacional patrimonial prevista.
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold shrink-0">
            NORMAL
          </span>
        </div>
      )}

      {/* Consumption Chart (Recharts) (PRD #27) */}
      <GlassCard className="p-5 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyber-cyan" />
              <span>Histórico de Consumo (kWh) e Faturamento (R$)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Evolução mês a mês das faturas lidas pela IA da Neoenergia Coelba
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {(['6M', '12M', '24M'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                  timeRange === range
                    ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-center p-6 space-y-2.5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <Zap className="w-8 h-8 text-slate-600" />
            <p className="text-xs font-bold text-slate-300">Nenhuma fatura processada ainda</p>
            <p className="text-[11px] text-slate-500 max-w-sm">
              Faça upload do PDF ou foto da sua conta de energia na Caixa de Entrada para gerar os gráficos de consumo e telemetria.
            </p>
            <button
              onClick={() => setIsEnergyInboxModalOpen(true)}
              className="mt-1 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Enviar Conta Real (PDF/Foto)</span>
            </button>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="mes" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#070d1d', 
                    borderColor: '#00f2fe',
                    borderRadius: '12px',
                    fontFamily: 'monospace',
                    fontSize: '11px'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="kwh" name="Consumo (kWh)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="valor" name="Valor (R$)" fill="#00f2fe" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      {/* Grid: 2 Sections (Active Connections & Invoices Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left: Registered Consumer Units (UCs) (PRD #5) */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>UCs Cadastradas ({energyConnections.length})</span>
            </h3>
            <button
              onClick={() => setIsEnergyConnectionModalOpen(true)}
              className="text-[11px] text-cyber-cyan hover:underline font-bold"
            >
              + Adicionar
            </button>
          </div>

          {energyConnections.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <Zap className="w-6 h-6 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Nenhuma Unidade Consumidora cadastrada ainda.</p>
              <button
                onClick={() => setIsEnergyConnectionModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold"
              >
                Cadastrar Primeira UC
              </button>
            </div>
          ) : (
            energyConnections.map(conn => (
              <div
                key={conn.id}
                onClick={() => setSelectedConnectionForDetail(conn)}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,242,254,0.15)] space-y-2 text-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate group-hover:text-cyber-cyan transition-colors">
                    {conn.propertyTitle}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {conn.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Distribuidora:</span>
                    <span className="text-slate-200 font-bold">{conn.providerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UC / Conta Contrato:</span>
                    <span className="text-amber-300 font-bold">{conn.consumerUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Titular:</span>
                    <span className="text-slate-200 truncate max-w-[120px]">{conn.holderName}</span>
                  </div>
                </div>

                {/* Inbound Email Preview Tag */}
                <div className="p-1.5 rounded-lg bg-black/40 border border-cyan-500/20 text-[10px] text-cyan-300 flex items-center justify-between">
                  <div className="flex items-center gap-1 truncate max-w-[170px]">
                    <Mail className="w-3 h-3 text-cyber-cyan shrink-0" />
                    <span className="truncate">{conn.inboxEmailAddress || `energia+${conn.consumerUnit}@inbox.locash.app`}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 group-hover:text-cyber-cyan font-bold transition-colors">
                    Ver ➔
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-2 text-slate-400">
                    {conn.emailEnabled && (
                      <span title="E-mail Ativo" className="flex items-center gap-1 text-cyan-400 text-[10px]">
                        <Mail className="w-3 h-3" /> E-mail
                      </span>
                    )}
                    {conn.whatsappEnabled && (
                      <span title="WhatsApp Ativo" className="flex items-center gap-1 text-emerald-400 text-[10px]">
                        <Phone className="w-3 h-3" /> WhatsApp
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Deseja remover a UC ${conn.consumerUnit}?`)) {
                        deleteEnergyConnection(conn.id);
                      }
                    }}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    title="Remover UC"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Invoices Table History (PRD #26) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>Histórico de Faturas Processadas</span>
            </h3>
            <button
              onClick={() => setIsEnergyInboxModalOpen(true)}
              className="text-[11px] text-amber-300 hover:underline font-bold"
            >
              + Enviar Fatura
            </button>
          </div>

          <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-mono">
                  <tr>
                    <th className="p-3">Competência</th>
                    <th className="p-3">Imóvel / UC</th>
                    <th className="p-3">Consumo</th>
                    <th className="p-3">Valor</th>
                    <th className="p-3">Vencimento</th>
                    <th className="p-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                  {sortedAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        Nenhuma fatura registrada nesta seleção.
                      </td>
                    </tr>
                  ) : (
                    sortedAccounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyber-cyan font-bold text-xs">
                              {acc.billingPeriod || 'N/D'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-white font-bold truncate max-w-[120px]">{acc.propertyTitle}</div>
                          <div className="text-[10px] text-amber-300/80">UC: {acc.consumerUnit}</div>
                        </td>
                        <td className="p-3 font-bold text-amber-300">
                          {acc.consumptionKwh} kWh
                        </td>
                        <td className="p-3 font-bold text-emerald-400">
                          R$ {acc.amountTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-slate-300">
                          {new Date(acc.dueDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {acc.barcode && (
                              <button
                                onClick={() => copyText(acc.barcode!, `bar-${acc.id}`)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="Copiar Código de Barras"
                              >
                                {copiedCode === `bar-${acc.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Barcode className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <button
                              onClick={() => deleteEnergyAccount(acc.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                              title="Excluir Registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* UC Detail & Inbound Email Modal */}
      <EnergyConnectionDetailModal
        connection={selectedConnectionForDetail}
        isOpen={!!selectedConnectionForDetail}
        onClose={() => setSelectedConnectionForDetail(null)}
        onDelete={deleteEnergyConnection}
        onOpenInbox={() => setIsEnergyInboxModalOpen(true)}
      />
    </div>
  );
};
