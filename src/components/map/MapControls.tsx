import React from 'react';
import { 
  Plus, 
  Minus, 
  Navigation, 
  Layers, 
  Flame, 
  Sparkles, 
  SlidersHorizontal, 
  Box, 
  RotateCw, 
  Loader2, 
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MapTheme } from '../../types';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterUser: () => void;
  onToggle3D: () => void;
  onRotate: () => void;
  is3DView: boolean;
  isLocating?: boolean;
  hasUserLocation?: boolean;
  propertiesCount: number;
  mapVisualMode: 'NORMAL' | 'HEATMAP' | 'BEAMS_3D';
  setMapVisualMode: (mode: 'NORMAL' | 'HEATMAP' | 'BEAMS_3D') => void;
  mapTheme: MapTheme;
  setMapTheme: (theme: MapTheme) => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onCenterUser,
  onToggle3D,
  onRotate,
  is3DView,
  isLocating = false,
  hasUserLocation = false,
  propertiesCount,
  mapVisualMode,
  setMapVisualMode,
  mapTheme,
  setMapTheme
}) => {
  const { setIsFilterModalOpen, filteredProperties, setSelectedProperty } = useApp();

  const isLight = mapTheme === 'CYBER_LIGHT';

  return (
    <>
      {/* Top Left HUD Telemetry Badge */}
      <div className="absolute top-4 left-4 z-20 hidden sm:flex flex-col gap-2">
        <div className={`glass-panel py-2 px-3.5 rounded-2xl flex items-center gap-3 ${isLight ? 'border-sky-500/40 bg-slate-900/90' : 'border-cyan-500/30'}`}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyber-cyan"></span>
            </span>
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              LOCASH IMOBILIÁRIA
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-mono text-cyber-cyan">
            {propertiesCount} IMÓVEIS
          </span>
          {hasUserLocation && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-[10px] font-mono text-cyber-emerald flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald animate-pulse"></span>
                GPS ATIVO
              </span>
            </>
          )}
        </div>

        {/* Quick Map Visual Layers (Normal, Beams, Heatmap) */}
        <div className="glass-panel p-1 rounded-xl flex items-center gap-1 border-slate-800 bg-slate-950/80">
          <button
            onClick={() => setMapVisualMode('NORMAL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mapVisualMode === 'NORMAL'
                ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Normal</span>
          </button>
          <button
            onClick={() => setMapVisualMode('BEAMS_3D')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mapVisualMode === 'BEAMS_3D'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Feixes 3D</span>
          </button>
          <button
            onClick={() => setMapVisualMode('HEATMAP')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mapVisualMode === 'HEATMAP'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap</span>
          </button>
        </div>
      </div>

      {/* Right Map Navigation Controls */}
      <div className="absolute right-4 top-4 z-20 flex flex-col gap-2">
        {/* Map Theme 3-way Switcher (Dark / Light / Satellite) */}
        <div className="flex flex-col rounded-2xl glass-panel border border-slate-700/60 overflow-hidden shadow-lg bg-slate-950/85">
          <button
            onClick={() => setMapTheme('CYBER_DARK')}
            className={`p-2.5 flex items-center justify-center transition-all border-b border-slate-800 ${
              mapTheme === 'CYBER_DARK' 
                ? 'bg-cyan-500/25 text-cyber-cyan font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="Modo Cyberpunk Dark"
          >
            <Moon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setMapTheme('CYBER_LIGHT')}
            className={`p-2.5 flex items-center justify-center transition-all border-b border-slate-800 ${
              mapTheme === 'CYBER_LIGHT' 
                ? 'bg-amber-400/25 text-amber-300 font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="Modo Cyberpunk Light (Fundo Branco)"
          >
            <Sun className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMapTheme('SATELLITE')}
            className={`p-2.5 flex items-center justify-center transition-all ${
              mapTheme === 'SATELLITE' 
                ? 'bg-emerald-500/25 text-cyber-emerald font-bold shadow-neon-emerald' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="Modo Satélite Real (Fotos em Alta Resolução)"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle 3D Perspective */}
        <button
          onClick={onToggle3D}
          className={`p-3 rounded-2xl glass-panel transition-all border shadow-lg group ${
            is3DView ? 'border-cyan-500/60 text-cyber-cyan shadow-neon-cyan' : 'border-slate-700/60 text-slate-300'
          }`}
          title="Alternar Perspectiva 3D / 2D"
        >
          <Box className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        {/* Rotate 360 */}
        <button
          onClick={onRotate}
          className="p-3 rounded-2xl glass-panel hover:glass-panel-glow text-slate-300 hover:text-cyber-cyan transition-all border border-slate-700/60 shadow-lg group"
          title="Girar Câmera 3D (45°)"
        >
          <RotateCw className="w-4 h-4 group-hover:rotate-45 transition-transform" />
        </button>

        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="p-3 rounded-2xl glass-panel hover:glass-panel-glow text-slate-300 hover:text-cyber-cyan transition-all border border-slate-700/60 shadow-lg group"
          title="Abrir Filtros Avançados"
        >
          <SlidersHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        {/* Real-Time GPS User Location Button */}
        <button
          onClick={onCenterUser}
          className={`p-3 rounded-2xl glass-panel hover:glass-panel-glow transition-all border shadow-lg group ${
            hasUserLocation 
              ? 'border-emerald-500/60 text-cyber-emerald shadow-neon-emerald' 
              : 'border-slate-700/60 text-slate-300 hover:text-cyber-cyan'
          }`}
          title="Minha Localização Atual em Tempo Real"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-cyber-cyan" />
          ) : (
            <Navigation className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
        </button>

        <div className="flex flex-col rounded-2xl glass-panel border border-slate-700/60 overflow-hidden shadow-lg">
          <button
            onClick={onZoomIn}
            className="p-3 text-slate-300 hover:text-cyber-cyan hover:bg-slate-800/60 transition-colors border-b border-slate-800"
            title="Aproximar (+)"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onZoomOut}
            className="p-3 text-slate-300 hover:text-cyber-cyan hover:bg-slate-800/60 transition-colors"
            title="Afastar (-)"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Quick Carousel of Properties (Elevated on mobile above bottom nav bar) */}
      <div className="absolute bottom-20 md:bottom-4 left-3 md:left-4 right-3 md:right-4 z-20 overflow-x-auto pb-1 flex gap-3 pointer-events-auto no-scrollbar max-w-4xl mx-auto">
        {filteredProperties.slice(0, 5).map(prop => (
          <div
            key={prop.id}
            onClick={() => setSelectedProperty(prop)}
            className={`shrink-0 w-60 sm:w-64 glass-panel p-2.5 rounded-xl border transition-all hover:scale-[1.02] flex items-center gap-3 group cursor-pointer shadow-lg backdrop-blur-md ${
              isLight ? 'border-slate-300 hover:border-sky-500/70 bg-white/95 text-slate-900 shadow-md' : 'border-slate-800 hover:border-cyan-500/50 bg-slate-950/90'
            }`}
          >
            <img
              src={prop.images[0]}
              alt={prop.title}
              className="w-14 h-14 rounded-lg object-cover border border-slate-700 group-hover:border-cyan-500/50 transition-colors"
            />
            <div className="flex-1 min-w-0">
              <span className={`text-[10px] font-mono uppercase font-bold ${isLight ? 'text-sky-600' : 'text-cyber-cyan'}`}>
                {prop.neighborhood}
              </span>
              <h4 className={`text-xs font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{prop.title}</h4>
              <p className={`text-xs font-bold font-mono mt-0.5 ${isLight ? 'text-emerald-600' : 'text-cyber-emerald'}`}>
                R$ {prop.rentPrice.toLocaleString('pt-BR')}<span className={`text-[10px] font-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>/mês</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
