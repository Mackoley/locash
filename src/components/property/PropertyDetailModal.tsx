import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/Badge';
import { 
  X, 
  Bed, 
  Bath, 
  Car, 
  Maximize2, 
  Heart, 
  Share2, 
  MessageSquare, 
  Check, 
  MapPin, 
  Dog, 
  Armchair, 
  ShieldAlert,
  Send,
  Edit
} from 'lucide-react';

export const PropertyDetailModal: React.FC = () => {
  const { 
    selectedProperty, 
    setSelectedProperty, 
    favorites, 
    toggleFavorite, 
    setActiveView, 
    activeView,
    sendChatMessage, 
    userRole,
    currentUser,
    setEditingProperty
  } = useApp();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [interestSent, setInterestSent] = useState(false);

  if (!selectedProperty) return null;

  const isOwner = Boolean(
    activeView === 'PROPRIEDADES' ||
    userRole === 'LANDLORD' ||
    (currentUser && (
      currentUser.id === selectedProperty.ownerId ||
      currentUser.role === 'LANDLORD'
    ))
  );

  const isFav = favorites.includes(selectedProperty.id);
  const isRented = selectedProperty.status === 'ALUGADO';
  const totalMonthly = selectedProperty.rentPrice + selectedProperty.condoFee + selectedProperty.propertyTax;

  const handleInterest = () => {
    setInterestSent(true);
    sendChatMessage(`👋 Olá! Tenho muito interesse no imóvel "${selectedProperty.title}". Gostaria de iniciar as tratativas.`, 'CONVERSA');
    setTimeout(() => {
      alert(`🎉 Solicitação de interesse enviada com sucesso para ${selectedProperty.ownerName}!`);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl h-full bg-cyber-darkest/98 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="sticky top-0 z-20 glass-panel border-b border-slate-800/80 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge status={selectedProperty.status} size="lg" />
            <span className="text-xs font-mono text-cyber-cyan uppercase font-bold">
              {selectedProperty.propertyType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(selectedProperty.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                isFav 
                  ? 'bg-red-500/20 text-red-400 border-red-500/50' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Favoritar"
            >
              <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('🔗 Link do imóvel copiado para a área de transferência!');
              }}
              className="p-2.5 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 hover:text-white transition-colors"
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedProperty(null)}
              className="p-2.5 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 hover:text-white transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-6 flex-1">
          {/* Main Gallery Preview */}
          <div className="space-y-3">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg">
              <img
                src={selectedProperty.images[activeImageIndex] || selectedProperty.images[0]}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-xs font-mono text-white border border-white/10">
                {activeImageIndex + 1} / {selectedProperty.images.length}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {selectedProperty.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {selectedProperty.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx ? 'border-cyber-cyan shadow-neon-cyan scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Location */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-cyber-cyan font-mono font-bold uppercase mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{selectedProperty.neighborhood}, {selectedProperty.city} - {selectedProperty.state}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {selectedProperty.title}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              {selectedProperty.publicAddress}
            </p>
          </div>

          {/* Price Breakdown Card */}
          <div className="p-4 rounded-2xl glass-panel border-cyan-500/30 bg-slate-900/90 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">Aluguel Mensal</span>
              <span className="text-2xl font-extrabold text-cyber-cyan font-mono">
                R$ {selectedProperty.rentPrice.toLocaleString('pt-BR')}
                <span className="text-xs text-slate-400 font-normal">/mês</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-xs font-mono">
              <div>
                <span className="text-slate-500">Condomínio</span>
                <p className="font-bold text-white">R$ {selectedProperty.condoFee.toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <span className="text-slate-500">IPTU</span>
                <p className="font-bold text-white">R$ {selectedProperty.propertyTax.toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <span className="text-slate-500">Total Estimado</span>
                <p className="font-bold text-cyber-emerald">R$ {totalMonthly.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>

          {/* Specifications Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-slate-200 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <Bed className="w-4 h-4 text-cyber-cyan" />
              <div>
                <span className="text-[10px] text-slate-500 block">Quartos</span>
                <span className="font-bold">{selectedProperty.bedrooms} dormitórios</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <Bath className="w-4 h-4 text-cyber-blue" />
              <div>
                <span className="text-[10px] text-slate-500 block">Banheiros</span>
                <span className="font-bold">{selectedProperty.bathrooms} banheiros</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <Car className="w-4 h-4 text-cyber-emerald" />
              <div>
                <span className="text-[10px] text-slate-500 block">Vagas</span>
                <span className="font-bold">{selectedProperty.parkingSpaces} vagas</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
              <Maximize2 className="w-4 h-4 text-cyber-amber" />
              <div>
                <span className="text-[10px] text-slate-500 block">Área Útil</span>
                <span className="font-bold">{selectedProperty.area} m²</span>
              </div>
            </div>
          </div>

          {/* Additional Features (Mobiliado, Pets) */}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <span className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              selectedProperty.furnished 
                ? 'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/40' 
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}>
              <Armchair className="w-3.5 h-3.5" />
              {selectedProperty.furnished ? 'Totalmente Mobiliado' : 'Sem Mobília'}
            </span>

            <span className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              selectedProperty.petsAllowed 
                ? 'bg-cyber-emerald/15 text-cyber-emerald border-cyber-emerald/40' 
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}>
              <Dog className="w-3.5 h-3.5" />
              {selectedProperty.petsAllowed ? 'Aceita Animais (Pet Friendly)' : 'Não Aceita Pets'}
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold text-slate-400 font-mono tracking-wider">
              Descrição do Imóvel
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
              {selectedProperty.description}
            </p>
          </div>

          {/* Landlord Profile Preview */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedProperty.ownerAvatar}
                alt={selectedProperty.ownerName}
                className="w-11 h-11 rounded-full object-cover border-2 border-cyber-cyan"
              />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">Proprietário / Locador</span>
                <h4 className="text-sm font-bold text-white">{selectedProperty.ownerName}</h4>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedProperty(null);
                setActiveView('MENSAGENS');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>Conversar</span>
            </button>
          </div>

          {/* Special Notice if ALUGADO according to PRD #9 */}
          {isRented && (
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-cyber-red shrink-0 mt-0.5" />
              <div>
                <b className="font-bold text-white block mb-0.5">Imóvel com Locação Ativa</b>
                Este imóvel já se encontra alugado. As informações públicas estão disponíveis para análise da ocupação regional, mas novas solicitações de visita ou interesse estão bloqueadas.
              </div>
            </div>
          )}

        </div>

        {/* Footer CTAs */}
        <div className="sticky bottom-0 z-20 glass-panel border-t border-slate-800/80 p-4 bg-cyber-darkest/98 flex items-center">
          {isOwner ? (
            /* Owner Action: Edit Property */
            <button
              onClick={() => {
                setEditingProperty(selectedProperty);
                setSelectedProperty(null);
              }}
              className="w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_25px_rgba(0,242,254,0.35)] transition-all transform active:scale-95 cursor-pointer"
              title="Editar dados e fotos do imóvel"
            >
              <Edit className="w-4 h-4 stroke-[2.5]" />
              <span>Editar Anúncio</span>
            </button>
          ) : !isRented ? (
            /* Visitor / Prospective Tenant Action: Register Interest */
            <button
              onClick={handleInterest}
              disabled={interestSent}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-neon-cyan transition-all transform active:scale-95 cursor-pointer ${
                interestSent 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_25px_rgba(0,242,254,0.35)]'
              }`}
            >
              {interestSent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4 stroke-[2.5]" />}
              <span>{interestSent ? 'Interesse Registrado!' : 'Tenho Interesse'}</span>
            </button>
          ) : (
            <div className="w-full text-center py-2 text-xs font-mono text-slate-500">
              Locação em andamento • Novas propostas indisponíveis
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
