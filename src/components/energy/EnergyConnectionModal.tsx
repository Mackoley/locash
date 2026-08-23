import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GlassCard } from '../ui/GlassCard';
import { 
  Zap, 
  X, 
  Building2, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Layers,
  HelpCircle
} from 'lucide-react';
import { DEFAULT_ENERGY_PROVIDERS } from '../../services/energyService';

export const EnergyConnectionModal: React.FC = () => {
  const { 
    isEnergyConnectionModalOpen, 
    setIsEnergyConnectionModalOpen, 
    properties, 
    selectedEnergyPropertyId, 
    setSelectedEnergyPropertyId,
    addEnergyConnection 
  } = useApp();

  const [propertyId, setPropertyId] = useState<string>('');
  const [providerId, setProviderId] = useState<string>('prov-coelba');
  const [consumerUnit, setConsumerUnit] = useState<string>('');
  const [holderName, setHolderName] = useState<string>('');
  const [holderDocument, setHolderDocument] = useState<string>('');
  const [emailEnabled, setEmailEnabled] = useState<boolean>(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState<boolean>(true);
  const [automaticRegistration, setAutomaticRegistration] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);

  useEffect(() => {
    if (selectedEnergyPropertyId) {
      setPropertyId(selectedEnergyPropertyId);
    } else if (properties.length > 0) {
      setPropertyId(properties[0].id);
    }
  }, [selectedEnergyPropertyId, properties, isEnergyConnectionModalOpen]);

  if (!isEnergyConnectionModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consumerUnit.trim()) return;

    setIsSubmitting(true);
    const selectedProp = properties.find(p => p.id === propertyId) || properties[0];
    const selectedProv = DEFAULT_ENERGY_PROVIDERS.find(p => p.id === providerId) || DEFAULT_ENERGY_PROVIDERS[0];

    const maskedDoc = holderDocument.trim() 
      ? holderDocument.length > 11 
        ? `${holderDocument.substring(0, 3)}.***.***/****-${holderDocument.slice(-2)}`
        : `***.${holderDocument.substring(3, 6)}.***-**`
      : '***.456.789-**';

    await addEnergyConnection({
      userId: 'landlord-1',
      propertyId: selectedProp ? selectedProp.id : 'prop-1',
      propertyTitle: selectedProp ? selectedProp.title : 'Imóvel em Gestão',
      providerId: selectedProv.id,
      providerName: selectedProv.name,
      consumerUnit: consumerUnit.trim(),
      holderName: holderName.trim() || 'PROPRIETÁRIO / LOCADOR',
      holderDocumentMasked: maskedDoc,
      emailEnabled,
      whatsappEnabled,
      automaticRegistration,
      status: 'ACTIVE'
    });

    setIsSubmitting(false);
    setSuccessMessage(true);

    setTimeout(() => {
      setSuccessMessage(false);
      setIsEnergyConnectionModalOpen(false);
      setConsumerUnit('');
      setHolderName('');
      setHolderDocument('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-cyan-500/40 bg-[#070d1d]/98 p-5 sm:p-7 shadow-[0_0_60px_rgba(0,242,254,0.25)] my-auto overflow-hidden animate-scale-up">
        
        {/* Top Glowing Edge */}
        <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00f2fe]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-300 tracking-wider">
                  LOCASH AUTOBILLS v1.0
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold border border-cyan-500/40">
                  IA OCR
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white font-mono">
                Cadastrar Unidade Consumidora (UC)
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsEnergyConnectionModalOpen(false)}
            className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMessage ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-scale-up">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">UC Cadastrada com Sucesso!</h3>
            <p className="text-xs text-slate-400 font-mono max-w-xs">
              As faturas da Neoenergia Coelba recebidas para esta UC serão processadas e lançadas automaticamente.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            {/* Imóvel Vinculado */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Imóvel Vinculado</span>
              </label>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyber-cyan focus:outline-none"
              >
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>
                    {prop.title} — {prop.neighborhood}, {prop.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Distribuidora */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Concessionária / Distribuidora</span>
              </label>
              <select
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                {DEFAULT_ENERGY_PROVIDERS.map(prov => (
                  <option key={prov.id} value={prov.id}>
                    {prov.name} ({prov.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Unidade Consumidora (UC) & Titular */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Unidade Consumidora (UC) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 7023819402"
                  value={consumerUnit}
                  onChange={(e) => setConsumerUnit(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyber-cyan focus:outline-none placeholder:text-slate-600"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Número impresso no topo da conta Coelba
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Nome do Titular
                </label>
                <input
                  type="text"
                  placeholder="Ex: Roberto Silva"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyber-cyan focus:outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Canais de Entrada Autorizados */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-300 block">
                Canais de Recebimento Digital
              </span>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyber-cyan focus:ring-0"
                  />
                  <Mail className="w-3.5 h-3.5 text-cyber-cyan" />
                  <span className="text-slate-200">Via E-mail</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-400 focus:ring-0"
                  />
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-200">Via WhatsApp</span>
                </label>
              </div>

              {consumerUnit.trim() && (
                <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span>E-mail dedicado gerado: </span>
                  <code className="text-cyber-cyan font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-cyan-500/20">
                    energia+{consumerUnit.trim()}@inbox.locash.app
                  </code>
                </div>
              )}
            </div>

            {/* Toggle Lançamento Automático */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
                  Lançamento Financeiro Automático
                </span>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Criar despesa automaticamente quando a confiança do OCR da Coelba for $\ge$ 95%.
                </p>
              </div>
              <input
                type="checkbox"
                checked={automaticRegistration}
                onChange={(e) => setAutomaticRegistration(e.target.checked)}
                className="w-5 h-5 rounded-lg bg-slate-900 border-slate-700 text-cyber-cyan focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex gap-2.5">
              <button
                type="button"
                onClick={() => setIsEnergyConnectionModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Salvando...' : 'Ativar Monitoramento'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
