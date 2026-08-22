import React from 'react';
import { Property } from '../../types';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/Badge';
import { Bed, Bath, Car, Maximize2, Heart, CheckCircle2 } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { 
    setSelectedProperty, 
    favorites, 
    toggleFavorite, 
    currentUser, 
    setIsAuthModalOpen 
  } = useApp();
  
  const isFav = favorites.includes(property.id);

  const handleCardClick = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      setSelectedProperty(property);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      toggleFavorite(property.id);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-neon-cyan flex flex-col justify-between group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge status={property.status} />
        </div>

        {/* Favorite Action */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
            isFav 
              ? 'bg-red-500/30 text-red-400 border border-red-500/50 shadow-neon-red' 
              : 'bg-slate-950/60 text-white hover:bg-slate-900 border border-white/10'
          }`}
        >
          <Heart className="w-4 h-4" fill={isFav ? "currentColor" : "none"} />
        </button>

        {/* Verified Badge */}
        {property.verified && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/75 backdrop-blur-md text-[10px] text-cyber-cyan border border-cyber-cyan/30 font-medium">
            <CheckCircle2 className="w-3 h-3 text-cyber-cyan" />
            <span>Verificado</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="text-cyber-cyan font-bold uppercase">{property.neighborhood}</span>
            <span>{property.city}, {property.state}</span>
          </div>

          <h3 className="text-base font-bold text-white mt-1 group-hover:text-cyber-cyan transition-colors line-clamp-1">
            {property.title}
          </h3>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-4 gap-2 py-2 border-y border-slate-800/80 text-slate-300 text-xs font-mono">
          <div className="flex items-center gap-1.5" title="Quartos">
            <Bed className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Banheiros">
            <Bath className="w-3.5 h-3.5 text-cyber-blue" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Vagas">
            <Car className="w-3.5 h-3.5 text-cyber-emerald" />
            <span>{property.parkingSpaces}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Área total">
            <Maximize2 className="w-3.5 h-3.5 text-cyber-amber" />
            <span>{property.area}m²</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Aluguel</span>
            <p className="text-lg font-extrabold text-white font-mono">
              R$ {property.rentPrice.toLocaleString('pt-BR')}
              <span className="text-xs text-slate-400 font-normal">/mês</span>
            </p>
          </div>

          <button className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 group-hover:bg-cyber-cyan text-slate-200 group-hover:text-slate-950 font-bold text-xs border border-slate-700 group-hover:border-transparent transition-all">
            Ver Imóvel
          </button>
        </div>
      </div>
    </div>
  );
};
