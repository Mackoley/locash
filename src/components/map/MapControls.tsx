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
  Sun,
  Moon,
  Globe,
  ChevronRight,
  ChevronLeft
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
  const [isExtraControlsOpen, setIsExtraControlsOpen] = useState<boolean>(false);

  return (
    <>
      {/* Top Left HUD Telemetry Badge */}
      <div className="absolute top-4 left-4 z-20 hidden sm:flex flex-col gap-2">
        <div className="glass-panel py-2 px-3.5 rounded-2xl flex items-center gap-3 border-cyan-500/30 bg-slate-950/90 shadow-lg">
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
      </div>

      {/* Right Map Navigation Controls (Clean Minimal: Filtros, Localização Atual e Gaveta Extra) */}
      <div className="absolute right-4 top-4 z-20 flex flex-col items-end gap-2.5">
        {/* 1. Real-Time GPS User Location Button (Sempre Visível) */}
        <button
          onClick={onCenterUser}
          className={`p-3 rounded-2xl glass-panel hover:glass-panel-glow transition-all border shadow-2xl group bg-slate-950/95 ${
            hasUserLocation 
              ? 'border-emerald-500/70 text-cyber-emerald shadow-neon-emerald' 
              : 'border-cyan-500/40 text-cyber-cyan hover:border-cyan-400'
          }`}
          title="Minha Localização Atual em Tempo Real"
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 animate-spin text-cyber-cyan" />
          ) : (
            <Navigation className="w-5 h-5 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* 2. Filtros Avançados Button (Sempre Visível) */}
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="p-3 rounded-2xl glass-panel hover:glass-panel-glow text-white hover:text-cyber-cyan transition-all border border-cyan-500/40 shadow-2xl group bg-slate-950/95"
          title="Abrir Filtros Avançados"
        >
          <SlidersHorizontal className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* 3. Botão Discreto para Expandir/Recolher Controles Secundários (3D, Temas, Zoom) */}
        <div className="relative flex items-center">
          {/* Controles Secundários Expandidos em Gaveta Suave */}
          {isExtraControlsOpen && (
            <div className="absolute right-14 top-0 flex flex-col gap-2 p-2 rounded-2xl glass-panel border border-cyan-500/30 bg-slate-950/95 shadow-2xl z-30 animate-fade-in">
              {/* Seletor de Temas (Dark / Light / Satellite) */}
              <div className="flex rounded-xl border border-slate-800 overflow-hidden bg-slate-900/90">
                <button
                  onClick={() => setMapTheme('CYBER_DARK')}
                  className={`p-2 flex items-center justify-center transition-all ${
                    mapTheme === 'CYBER_DARK' ? 'bg-cyan-500/30 text-cyber-cyan' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Modo Cyberpunk Dark"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMapTheme('CYBER_LIGHT')}
                  className={`p-2 flex items-center justify-center transition-all border-x border-slate-800 ${
                    mapTheme === 'CYBER_LIGHT' ? 'bg-amber-400/30 text-amber-300' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Modo Cyberpunk Light"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMapTheme('SATELLITE')}
                  className={`p-2 flex items-center justify-center transition-all ${
                    mapTheme === 'SATELLITE' ? 'bg-emerald-500/30 text-cyber-emerald' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Modo Satélite Real"
                >
                  <Globe className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Botão 3D & Girar */}
              <div className="flex gap-1.5">
                <button
                  onClick={onToggle3D}
                  className={`flex-1 p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    is3DView 
                      ? 'bg-cyan-500/20 text-cyber-cyan border-cyan-500/40' 
                      : 'bg-slate-900/80 text-slate-400 border-slate-800'
                  }`}
                  title="Perspectiva 3D"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D</span>
                </button>
                <button
                  onClick={onRotate}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-cyber-cyan transition-all"
                  title="Girar 45°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Camadas (Normal / Feixes 3D / Heatmap) */}
              <div className="flex flex-col gap-1 border-t border-slate-800 pt-1.5">
                <button
                  onClick={() => setMapVisualMode('NORMAL')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 transition-all ${
                    mapVisualMode === 'NORMAL'
                      ? 'bg-cyan-500/20 text-cyber-cyan border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Normal</span>
                </button>
                <button
                  onClick={() => setMapVisualMode('BEAMS_3D')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 transition-all ${
                    mapVisualMode === 'BEAMS_3D'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Feixes 3D</span>
                </button>
                <button
                  onClick={() => setMapVisualMode('HEATMAP')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 transition-all ${
                    mapVisualMode === 'HEATMAP'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  <span>Heatmap</span>
                </button>
              </div>

              {/* Zoom (+ / -) */}
              <div className="flex rounded-xl border border-slate-800 overflow-hidden bg-slate-900/90">
                <button
                  onClick={onZoomIn}
                  className="flex-1 p-1.5 text-slate-300 hover:text-cyber-cyan flex items-center justify-center border-r border-slate-800"
                  title="Aproximar (+)"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onZoomOut}
                  className="flex-1 p-1.5 text-slate-300 hover:text-cyber-cyan flex items-center justify-center"
                  title="Afastar (-)"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Botão Gatilho Discreto de Camadas/Config */}
          <button
            onClick={() => setIsExtraControlsOpen(!isExtraControlsOpen)}
            className={`p-2.5 rounded-2xl glass-panel transition-all border shadow-lg group bg-slate-950/80 ${
              isExtraControlsOpen 
                ? 'border-cyan-500/60 text-cyber-cyan shadow-neon-cyan' 
                : 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
            title={isExtraControlsOpen ? 'Recolher Controles' : 'Mais Opções do Mapa (3D, Temas, Zoom)'}
          >
            <Layers className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Quick Carousel of Properties */}
      <div className="absolute bottom-20 md:bottom-4 left-3 md:left-4 right-3 md:right-4 z-20 overflow-x-auto pb-1 flex gap-3 pointer-events-auto no-scrollbar max-w-4xl mx-auto">
        {filteredProperties.slice(0, 5).map(prop => (
          <div
            key={prop.id}
            onClick={() => setSelectedProperty(prop)}
            className="shrink-0 w-60 sm:w-64 glass-panel p-2.5 rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-slate-950/95 text-white transition-all hover:scale-[1.02] flex items-center gap-3 group cursor-pointer shadow-2xl backdrop-blur-xl"
          >
            <img
              src={prop.images[0]}
              alt={prop.title}
              className="w-14 h-14 rounded-lg object-cover border border-slate-700 group-hover:border-cyan-500/50 transition-colors"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono uppercase font-bold text-cyber-cyan">
                {prop.neighborhood}
              </span>
              <h4 className="text-xs font-semibold text-white truncate">{prop.title}</h4>
              <p className="text-xs font-bold font-mono text-cyber-emerald mt-0.5">
                R$ {prop.rentPrice.toLocaleString('pt-BR')}<span className="text-[10px] text-slate-400 font-normal">/mês</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
