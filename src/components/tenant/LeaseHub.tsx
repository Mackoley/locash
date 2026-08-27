import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/Badge';
import { GlassCard } from '../ui/GlassCard';
import { LeaseFinanceTab } from '../lease/LeaseFinanceTab';
import { LeaseMaintenanceTab } from '../lease/LeaseMaintenanceTab';
import { LeaseDocumentsTab } from '../lease/LeaseDocumentsTab';
import { LeaseChatTab } from '../lease/LeaseChatTab';
import { 
  Home, 
  DollarSign, 
  FileText, 
  Wrench, 
  FolderLock, 
  MessageSquare, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck,
  Percent
} from 'lucide-react';

export const LeaseHub: React.FC = () => {
  const { activeLease, userRole } = useApp();
  const [activeTab, setActiveTab] = useState<'VISAO_GERAL' | 'FINANCEIRO' | 'CONTRATO' | 'MANUTENCAO' | 'DOCUMENTOS' | 'CONVERSA'>('VISAO_GERAL');

  const tabs = [
    { id: 'VISAO_GERAL', label: 'Visão Geral', icon: Home },
    { id: 'FINANCEIRO', label: 'Financeiro', icon: DollarSign },
    { id: 'CONTRATO', label: 'Contrato', icon: FileText },
    { id: 'MANUTENCAO', label: 'Manutenção', icon: Wrench },
    { id: 'DOCUMENTOS', label: 'Documentos', icon: FolderLock },
    { id: 'CONVERSA', label: 'Chat da Locação', icon: MessageSquare }
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full no-scrollbar pb-20 md:pb-8">
      {/* Central da Locação Header Banner (PRD #52) */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800/80 bg-[#091022]/80 backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_20px_rgba(0,242,254,0.3)] shrink-0">
              <Home className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge status="ACTIVE" size="sm" />
                <span className="text-xs font-mono font-bold text-cyan-300">
                  CONTRATO #{activeLease.id.toUpperCase()}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5 font-mono">
                {activeLease.propertyTitle}
              </h1>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeLease.propertyAddress}</span>
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-bold">Valor Mensal</span>
              <p className="font-extrabold text-emerald-400 text-lg">
                R$ {activeLease.rentAmount.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-slate-500 text-[10px] uppercase block font-bold">Vencimento</span>
              <p className="font-bold text-white text-sm">Todo dia {activeLease.dueDay}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation (PRD #52) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-800/80 text-xs font-mono no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-neon-cyan'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'VISAO_GERAL' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
          {/* Key Dates Card */}
          <GlassCard glow="cyan" className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyber-cyan" />
              Prazos e Vigência
            </h3>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-500">Início do Contrato:</span>
                <b className="text-white">{activeLease.startDate}</b>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-500">Término do Contrato:</span>
                <b className="text-white">{activeLease.endDate}</b>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-500">Caução Depositada:</span>
                <b className="text-cyber-emerald">R$ {activeLease.depositAmount.toLocaleString('pt-BR')}</b>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Índice Reajuste:</span>
                <b className="text-cyber-cyan">{activeLease.adjustmentIndex} (Próx: {activeLease.nextAdjustmentDate})</b>
              </div>
            </div>
          </GlassCard>

          {/* Landlord & Tenant Contacts */}
          <GlassCard glow="blue" className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              Partes do Contrato
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase">Locador (Proprietário)</span>
                <p className="font-bold text-white">{activeLease.landlordName}</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-cyber-cyan" />
                  {activeLease.landlordPhone}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase">Locatário (Inquilino)</span>
                <p className="font-bold text-white">{activeLease.tenantName}</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-cyber-emerald" />
                  {activeLease.tenantPhone}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions Shortcuts */}
          <GlassCard glow="purple" className="p-5 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyber-purple" />
                Acesso Rápido
              </h3>
              <p className="text-slate-400 text-[11px] mt-1">
                Atalhos rápidos para operações frequentes da locação
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('FINANCEIRO')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-left flex items-center justify-between transition-colors font-bold"
              >
                <span>💰 Pagar Aluguel / Ver Recibos</span>
                <span>→</span>
              </button>
              <button
                onClick={() => setActiveTab('MANUTENCAO')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-left flex items-center justify-between transition-colors font-bold"
              >
                <span>🔧 Abrir Chamado de Reparo</span>
                <span>→</span>
              </button>
              <button
                onClick={() => setActiveTab('CONVERSA')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-left flex items-center justify-between transition-colors font-bold"
              >
                <span>💬 Falar no Chat com o Proprietário</span>
                <span>→</span>
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'FINANCEIRO' && <LeaseFinanceTab />}

      {activeTab === 'CONTRATO' && (
        <GlassCard className="p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">INSTRUMENTO PARTICULAR DE LOCAÇÃO RESIDENCIAL</h3>
              <p className="text-slate-400 text-[11px]">Código de Autenticação Digital: SHA-256 #98f7e2a9b34c</p>
            </div>
            <button
              onClick={() => alert('📄 Contrato assinado em PDF baixado com sucesso!')}
              className="px-4 py-2 rounded-xl bg-cyber-cyan text-slate-950 font-bold shadow-neon-cyan"
            >
              Baixar Contrato Completo
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 leading-relaxed text-slate-300">
            <p><b>CLÁUSULA 1ª — DO OBJETO:</b> O presente contrato tem por objeto a locação do imóvel residencial situado em {activeLease.propertyAddress}.</p>
            <p><b>CLÁUSULA 2ª — DO VALOR:</b> O aluguel mensal ajustado é de R$ {activeLease.rentAmount.toLocaleString('pt-BR')}, com vencimento impreterível todo dia {activeLease.dueDay} de cada mês.</p>
            <p><b>CLÁUSULA 3ª — DO REAJUSTE:</b> O valor será reajustado anualmente com base na variação acumulada do índice {activeLease.adjustmentIndex}, na data base de {activeLease.nextAdjustmentDate}.</p>
            <p><b>CLÁUSULA 4ª — DA CAUÇÃO:</b> O Locatário prestou caução em dinheiro no valor de R$ {activeLease.depositAmount.toLocaleString('pt-BR')}, depositada em conta de garantia remunerada.</p>
          </div>
        </GlassCard>
      )}

      {activeTab === 'MANUTENCAO' && <LeaseMaintenanceTab />}

      {activeTab === 'DOCUMENTOS' && <LeaseDocumentsTab />}

      {activeTab === 'CONVERSA' && <LeaseChatTab />}
    </div>
  );
};
