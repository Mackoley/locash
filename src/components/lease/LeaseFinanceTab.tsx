import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/Badge';
import { GlassCard } from '../ui/GlassCard';
import { DollarSign, CheckCircle2, AlertCircle, Clock, QrCode, CreditCard, Receipt, FileText } from 'lucide-react';

export const LeaseFinanceTab: React.FC = () => {
  const { payments, recordPayment, activeLease, userRole } = useApp();
  const [selectedPaymentForModal, setSelectedPaymentForModal] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('PIX Instantâneo');
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingPayment = payments.find(p => p.status === 'PENDENTE' || p.status === 'ATRASADO');

  const handleConfirmPayment = () => {
    if (!selectedPaymentForModal) return;
    setIsProcessing(true);
    setTimeout(() => {
      recordPayment(selectedPaymentForModal.id, paymentMethod);
      setIsProcessing(false);
      setSelectedPaymentForModal(null);
      alert('🎉 Pagamento registrado e confirmado com sucesso! O comprovante foi gerado.');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Next Pending Due Date */}
      {pendingPayment && (
        <GlassCard glow="cyan" className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyber-cyan animate-pulse" />
                <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
                  Próximo Vencimento
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-white font-mono mt-1">
                R$ {pendingPayment.amount.toLocaleString('pt-BR')}
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Referente a <b>{pendingPayment.referenceMonth}</b> • Vencimento em <b>{pendingPayment.dueDate}</b>
              </p>
            </div>

            {userRole === 'TENANT' && (
              <button
                onClick={() => setSelectedPaymentForModal(pendingPayment)}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs font-mono shadow-[0_0_20px_rgba(0,242,254,0.35)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <DollarSign className="w-4 h-4 stroke-[3]" />
                <span>Pagar Aluguel (PIX / Boleto)</span>
              </button>
            )}
          </div>
        </GlassCard>
      )}

      {/* Payment History Table */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-cyber-cyan" />
              Histórico de Pagamentos de Aluguel
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Controle financeiro e comprovantes da locação
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Mês Referência</th>
                <th className="pb-3 font-semibold">Valor</th>
                <th className="pb-3 font-semibold">Vencimento</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Método</th>
                <th className="pb-3 font-semibold text-right">Comprovante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 font-bold text-white">{pay.referenceMonth}</td>
                  <td className="py-3.5 font-bold text-cyber-emerald">
                    R$ {pay.amount.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3.5 text-slate-300">{pay.dueDate}</td>
                  <td className="py-3.5">
                    <Badge status={pay.status} size="sm" />
                  </td>
                  <td className="py-3.5 text-slate-400">
                    {pay.paymentMethod || 'Aguardando'}
                  </td>
                  <td className="py-3.5 text-right">
                    {pay.status === 'PAGO' ? (
                      <button
                        onClick={() => alert(`📄 Comprovante do mês ${pay.referenceMonth} baixado com sucesso!`)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Recibo</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedPaymentForModal(pay)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-[11px] shadow-sm hover:shadow-neon-cyan transition-all transform active:scale-95 cursor-pointer"
                      >
                        Pagar Agora
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Simulated Payment Modal */}
      {selectedPaymentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-cyber-darkest border border-cyan-500/40 rounded-3xl p-6 shadow-neon-cyan space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cyber-cyan" />
                Registrar Pagamento do Aluguel
              </h3>
              <button 
                onClick={() => setSelectedPaymentForModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400">Referência:</span>
              <p className="font-bold text-white text-sm">{selectedPaymentForModal.referenceMonth}</p>
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-slate-400">Valor Total:</span>
                <span className="text-lg font-extrabold text-cyber-emerald">
                  R$ {selectedPaymentForModal.amount.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-slate-400 block font-bold">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('PIX Instantâneo')}
                  className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all ${
                    paymentMethod === 'PIX Instantâneo'
                      ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold shadow-neon-cyan'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>PIX Instantâneo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Boleto Bancário')}
                  className={`p-3 rounded-xl border flex items-center gap-2 text-left transition-all ${
                    paymentMethod === 'Boleto Bancário'
                      ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan font-bold shadow-neon-cyan'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Boleto / Ted</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'PIX Instantâneo' && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-center space-y-2">
                <p className="text-[11px] text-slate-300">Chave PIX Aleatória (LOCASH Custódia):</p>
                <code className="block bg-slate-950 p-2 rounded-lg text-cyber-cyan text-[10px] break-all border border-slate-800">
                  00020126580014br.gov.bcb.pix0136locash-99123-sp-realestate
                </code>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPaymentForModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-cyber-cyan hover:bg-cyan-400 text-slate-950 font-extrabold shadow-neon-cyan flex items-center justify-center gap-1.5"
              >
                {isProcessing ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
