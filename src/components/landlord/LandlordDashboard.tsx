import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../ui/StatCard';
import { GaugeChart } from '../ui/GaugeChart';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { 
  Building2, 
  DollarSign, 
  Wrench, 
  Users, 
  TrendingUp, 
  Calendar,
  MessageSquare,
  ArrowUpRight,
  Zap,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
const REVENUE_CHART_DATA = [
  { mes: 'Mar', receita: 18500 },
  { mes: 'Abr', receita: 19800 },
  { mes: 'Mai', receita: 22400 },
  { mes: 'Jun', receita: 24100 },
  { mes: 'Jul', receita: 26800 },
  { mes: 'Ago', receita: 28400 },
];

export const LandlordDashboard: React.FC = () => {
  const { 
    landlordStats, 
    setActiveView, 
    properties, 
    setSelectedProperty, 
    energyAccounts, 
    energyConnections, 
    setIsEnergyInboxModalOpen 
  } = useApp();

  const totalEnergyThisMonth = energyAccounts.reduce((acc, c) => acc + c.amountTotal, 0);
  const totalKwhThisMonth = energyAccounts.reduce((acc, c) => acc + c.consumptionKwh, 0);

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full no-scrollbar pb-20 md:pb-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-5 rounded-3xl border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse shadow-neon-cyan" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
              CARTEIRA IMOBILIÁRIA
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Gestão Executiva e Telemetria em Tempo Real do Seu Patrimônio
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('MAPA')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyber-cyan border border-cyber-cyan/30 text-xs font-bold font-mono transition-all"
          >
            <span>Ver no Mapa GIS</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Top KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receita Recorrente"
          value={`R$ ${landlordStats.monthlyRevenue.toLocaleString('pt-BR')}`}
          subtitle="Faturamento mensal ativo"
          accentColor="cyan"
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: '12.4% vs mês anterior', isPositive: true }}
        />

        <StatCard
          title="A Receber / Pendente"
          value={`R$ ${landlordStats.pendingReceivables.toLocaleString('pt-BR')}`}
          subtitle="Vencimentos em aberto"
          accentColor="amber"
          icon={<Calendar className="w-5 h-5" />}
        />

        <StatCard
          title="Total de Imóveis"
          value={landlordStats.totalProperties}
          subtitle={`${landlordStats.rentedCount} alugados • ${landlordStats.availableCount} disponíveis`}
          accentColor="emerald"
          icon={<Building2 className="w-5 h-5" />}
          trend={{ value: '+2 novos este mês', isPositive: true }}
        />

        <StatCard
          title="Manutenções Abertas"
          value={landlordStats.openMaintenanceCount}
          subtitle="Chamados em atendimento"
          accentColor="purple"
          icon={<Wrench className="w-5 h-5" />}
        />
      </div>

      {/* AutoBills — Telemetria de Energia & Patrimônio (PRD #25, #68 & #70) */}
      <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-950/90 to-cyan-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg font-mono">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md shrink-0">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                LOCASH AUTOBILLS • NEOENERGIA COELBA
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                🟢 {energyConnections.length} UCs Monitoradas
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Energia Total: R$ {totalEnergyThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({totalKwhThisMonth} kWh)
            </h3>
            <p className="text-[11px] text-slate-400">
              Contas lidas por IA com conciliação contábil automática e auditoria de consumo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsEnergyInboxModalOpen(true)}
            className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <span>Enviar Conta</span>
          </button>
          <button
            onClick={() => setActiveView('ENERGIA')}
            className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span>Ver Telemetria</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Bar Chart */}
        <GlassCard glow="cyan" className="lg:col-span-2 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyber-cyan" />
                Histórico de Faturamento (Últimos 6 Meses)
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Receita líquida auferida e índice de adimplência 100%
              </p>
            </div>
            <span className="text-xs font-bold text-cyber-emerald bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-mono">
              +31.8% CRESCIMENTO
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_CHART_DATA}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `R$ ${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e3a66', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                />
                <Bar dataKey="receita" fill="#00f2fe" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Occupancy Rate Telemetry Gauge */}
        <GlassCard glow="emerald" className="p-5 flex flex-col justify-between items-center text-center">
          <div className="w-full text-left">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Taxa de Ocupação da Carteira
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Índice de aproveitamento dos imóveis
            </p>
          </div>

          <div className="my-2">
            <GaugeChart value={landlordStats.occupancyRate} title="Ocupação Global" size={170} />
          </div>

          {/* Mini Pie Breakdown */}
          <div className="w-full grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-[10px] font-mono">
            <div>
              <span className="text-cyber-emerald block font-bold">● {landlordStats.rentedCount} Alugados</span>
              <span className="text-slate-500">{landlordStats.occupancyRate}%</span>
            </div>
            <div>
              <span className="text-cyber-cyan block font-bold">● {landlordStats.availableCount} Livres</span>
              <span className="text-slate-500">{Math.round((landlordStats.availableCount / landlordStats.totalProperties) * 100)}%</span>
            </div>
            <div>
              <span className="text-cyber-purple block font-bold">● {landlordStats.negotiatingCount} Negoc.</span>
              <span className="text-slate-500">8%</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Properties & Leads Table */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-cyber-cyan" />
              Gestão Rápida de Imóveis e Leads
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Monitore visualizações, interessados e status operacional
            </p>
          </div>

          <button
            onClick={() => setActiveView('MEUS_IMOVEIS')}
            className="text-xs text-cyber-cyan hover:underline font-mono font-bold"
          >
            Ver Todos os Imóveis →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Imóvel</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Valor Aluguel</th>
                <th className="pb-3 font-semibold">Views</th>
                <th className="pb-3 font-semibold">Interessados</th>
                <th className="pb-3 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {properties.slice(0, 5).map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <img src={prop.images[0]} alt={prop.title} className="w-10 h-10 rounded-lg object-cover border border-slate-800" />
                      <div>
                        <span className="font-bold text-white block">{prop.title}</span>
                        <span className="text-[10px] text-slate-400">{prop.neighborhood}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <Badge status={prop.status} size="sm" />
                  </td>
                  <td className="py-3 font-bold text-cyber-emerald">
                    R$ {prop.rentPrice.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 text-slate-300">{prop.viewsCount}</td>
                  <td className="py-3 text-cyber-cyan font-bold">{prop.contactCount} interessados</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setSelectedProperty(prop)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700"
                    >
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
