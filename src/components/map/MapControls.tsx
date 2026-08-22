import React, { useState } from 'react';
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
  Palette,
  Check
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
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const themeOptions: { id: MapTheme; name: string; iconColor: string; bg: string; desc: string }[] = [
    {
      id: 'CYBER_DARK',
      name: 'Cyberpunk Dark',
      iconColor: 'from-cyber-cyan to-blue-600',
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      desc: 'Preto profundo com neons ciano e esmeralda'
    },
    {
      id: 'MIDNIGHT_BLUE',
      name: 'Midnight Blue',
      iconColor: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-500/10 border-blue-500/30',
      desc: 'Azul-marinho estelar com azul elétrico'
    },
    {
      id: 'MATRIX_EMERALD',
      name: 'Matrix Emerald',
      iconColor: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      desc: 'Verde cibernético de alta tecnologia'
    },
    {
      id: 'OLED_MONOCHROME',
      name: 'OLED Monochrome',
      iconColor: 'from-slate-200 to-slate-400',
      bg: 'bg-slate-500/10 border-slate-400/30',
      desc: 'Preto puro com contraste branco acetinado'
    }
  ];

  return (
    <>
      {/* Top Left HUD Telemetry Badge */}
      <div className="absolute top-4 left-4 z-20 hidden sm:flex flex-col gap-2">
        <div className="glass-panel py-2 px-3.5 rounded-2xl flex items-center gap-3 border-cyan-500/30">
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
            {propertiesCount} IMÓVEIS MAPEADOS
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

        {/* Quick Map Mode Switcher */}
        <div className="glass-panel p-1 rounded-xl flex items-center gap-1 border-slate-800">
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

        {/* Theme Palette Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className={`p-3 rounded-2xl glass-panel transition-all border shadow-lg group ${
              isThemeMenuOpen 
                ? 'border-purple-500/60 text-cyber-purple shadow-neon-purple' 
                : 'border-slate-700/60 text-slate-300 hover:text-cyber-purple'
            }`}
            title="Personalizar Cores e Tema do Mapa"
          >
            <Palette className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          {/* Theme Selector Floating Panel */}
          {isThemeMenuOpen && (
            <div className="absolute right-14 top-0 w-64 glass-panel border border-cyan-500/40 p-3 rounded-2xl shadow-2xl space-y-2 z-50 animate-fade-in bg-slate-950/95 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-cyber-cyan" />
                  Paleta de Cores
                </span>
                <span className="text-[10px] text-slate-400 font-mono">4 TEMAS</span>
              </div>

              <div className="space-y-1.5">
                {themeOptions.map((opt) => {
                  const isSelected = mapTheme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setMapTheme(opt.id);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all group ${
                        isSelected 
                          ? `${opt.bg} shadow-sm` 
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${opt.iconColor} shrink-0 shadow-sm`} />
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {opt.name}
                          </div>
                          <div className="text-[9px] text-slate-400 leading-tight">
                            {opt.desc}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-cyber-cyan shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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

      {/* Bottom Floating Quick Carousel of Properties */}
      <div className="absolute bottom-4 left-4 right-4 z-20 overflow-x-auto pb-1 flex gap-3 pointer-events-auto no-scrollbar max-w-4xl mx-auto">
        {filteredProperties.slice(0, 5).map(prop => (
          <div
            key={prop.id}
            onClick={() => setSelectedProperty(prop)}
            className="shrink-0 w-64 glass-panel p-2.5 rounded-xl border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-3 group"
          >
            <img
              src={prop.images[0]}
              alt={prop.title}
              className="w-14 h-14 rounded-lg object-cover border border-slate-700 group-hover:border-cyan-500/50 transition-colors"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono text-cyber-cyan uppercase font-bold">
                {prop.neighborhood}
              </span>
              <h4 className="text-xs font-semibold text-white truncate">{prop.title}</h4>
              <p className="text-xs font-bold text-cyber-emerald font-mono mt-0.5">
                R$ {prop.rentPrice.toLocaleString('pt-BR')}<span className="text-[10px] text-slate-400 font-normal">/mês</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
