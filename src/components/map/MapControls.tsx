import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  X
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
  const { setIsFilterModalOpen, filteredProperties, setSelectedProperty, selectedProperty } = useApp();
  const [isExtraControlsOpen, setIsExtraControlsOpen] = useState<boolean>(false);
  const extraControlsRef = useRef<HTMLDivElement>(null);

  // Close extra controls / theme popup whenever user clicks, drags or touches anywhere on the map or outside
  useEffect(() => {
    if (!isExtraControlsOpen) return;

    const handleOutsideInteraction = (e: MouseEvent | TouchEvent | PointerEvent) => {
      if (extraControlsRef.current && !extraControlsRef.current.contains(e.target as Node)) {
        setIsExtraControlsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideInteraction, { capture: true });
    document.addEventListener('touchstart', handleOutsideInteraction, { capture: true });
    document.addEventListener('mousedown', handleOutsideInteraction, { capture: true });

    return () => {
      document.removeEventListener('pointerdown', handleOutsideInteraction, { capture: true });
      document.removeEventListener('touchstart', handleOutsideInteraction, { capture: true });
      document.removeEventListener('mousedown', handleOutsideInteraction, { capture: true });
    };
  }, [isExtraControlsOpen]);

  return (
    <>

      {/* Right Map Navigation Controls (Clean Minimal: Filtros, Localização Atual e Gaveta Extra) */}
      <div className="absolute right-4 top-4 z-20 flex flex-col items-end gap-2">
        {/* 1. Real-Time GPS User Location Button (Sempre Visível) */}
        <button
          onClick={onCenterUser}
          className={`w-9 h-9 p-2 rounded-xl glass-panel hover:glass-panel-glow transition-all border shadow-lg flex items-center justify-center group bg-slate-950/90 ${
            hasUserLocation 
              ? 'border-emerald-500/70 text-cyber-emerald shadow-neon-emerald' 
              : 'border-cyan-500/40 text-cyber-cyan hover:border-cyan-400'
          }`}
          title="Minha Localização Atual em Tempo Real"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-cyber-cyan" />
          ) : (
            <Navigation className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* 2. Filtros Avançados Button (Sempre Visível) */}
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="w-9 h-9 p-2 rounded-xl glass-panel hover:glass-panel-glow text-white hover:text-cyber-cyan transition-all border border-cyan-500/40 shadow-lg flex items-center justify-center group bg-slate-950/90"
          title="Abrir Filtros Avançados"
        >
          <SlidersHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        {/* 3. Botão Discreto para Expandir/Recolher Controles Secundários (3D, Temas, Zoom) */}
        <div ref={extraControlsRef} className="relative flex items-center">
          {/* Controles Secundários Expandidos em Gaveta Suave */}
          {isExtraControlsOpen && (
            <div className="absolute right-12 top-0 flex flex-col gap-2 p-2 rounded-2xl glass-panel border border-cyan-500/30 bg-slate-950/95 shadow-2xl z-30 animate-fade-in">
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
            className={`w-9 h-9 p-2 rounded-xl glass-panel transition-all border shadow-lg flex items-center justify-center group bg-slate-950/90 ${
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

      {/* Bottom Selected Property Card (Apenas quando um imóvel for clicado/selecionado) */}
      {selectedProperty && (
        <div className="absolute bottom-20 md:bottom-4 left-3 md:left-4 right-3 md:right-4 z-20 flex justify-center pointer-events-auto max-w-md mx-auto animate-fade-in">
          <div
            onClick={() => {
              // Clicking opens full details if desired
            }}
            className="w-full glass-panel p-2.5 rounded-2xl border border-cyan-500/50 bg-slate-950/98 text-white shadow-2xl backdrop-blur-xl flex items-center gap-3 relative group cursor-pointer"
          >
            <img
              src={selectedProperty.images[0]}
              alt={selectedProperty.title}
              className="w-14 h-14 rounded-xl object-cover border border-cyan-500/40 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono uppercase font-bold text-cyber-cyan">
                {selectedProperty.neighborhood} • {selectedProperty.city}
              </span>
              <h4 className="text-xs font-semibold text-white truncate">{selectedProperty.title}</h4>
              <p className="text-xs font-bold font-mono text-cyber-emerald mt-0.5">
                R$ {selectedProperty.rentPrice.toLocaleString('pt-BR')}<span className="text-[10px] text-slate-400 font-normal">/mês</span>
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProperty(null);
              }}
              className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 transition-all shrink-0 cursor-pointer"
              title="Fechar card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
