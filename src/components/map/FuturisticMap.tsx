import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Property, MapTheme } from '../../types';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapControls } from './MapControls';

export const FuturisticMap: React.FC = () => {
  const { 
    filteredProperties, 
    selectedProperty, 
    setSelectedProperty, 
    mapVisualMode,
    setMapVisualMode,
    mapTheme,
    setMapTheme,
    userLocation,
    isLocating,
    requestUserLocation,
    searchTarget
  } = useApp();
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const searchMarkerRef = useRef<maplibregl.Marker | null>(null);
  const hasAutoCenteredRef = useRef<boolean>(false);
  const [is3DView, setIs3DView] = useState(true);

  // Reliable Cyber Dark Style Specification with High-Res CartoDB Tiles
  const darkStyleSpec: maplibregl.StyleSpecification = {
    version: 8,
    sources: {
      'carto-dark-tiles': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
        ],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      }
    },
    layers: [
      {
        id: 'carto-dark-layer',
        type: 'raster',
        source: 'carto-dark-tiles',
        minzoom: 0,
        maxzoom: 20
      }
    ]
  };

  // Initialize MapLibre Map with Middle-Click Scroll Drag Rotation
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    const initialCenter: [number, number] = userLocation 
      ? [userLocation.lng, userLocation.lat] 
      : [-46.6753, -23.5855];

    const map = new maplibregl.Map({
      container,
      style: darkStyleSpec,
      center: initialCenter,
      zoom: userLocation ? 15.5 : 13.8,
      pitch: 52, // 3D Camera Perspective
      bearing: -18,
      dragRotate: true,
      touchPitch: true,
      attributionControl: false
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    // Middle Mouse Button Drag Rotation & Pitch
    let isMiddleDragging = false;
    let startX = 0;
    let startY = 0;
    let startBearing = 0;
    let startPitch = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        isMiddleDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startBearing = map.getBearing();
        startPitch = map.getPitch();
        container.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMiddleDragging) return;
      e.preventDefault();
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newBearing = startBearing + deltaX * 0.45;
      const newPitch = Math.min(Math.max(startPitch - deltaY * 0.35, 0), 80);

      map.setBearing(newBearing);
      map.setPitch(newPitch);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1 || isMiddleDragging) {
        isMiddleDragging = false;
        container.style.cursor = '';
      }
    };

    const handleAuxClick = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('auxclick', handleAuxClick);

    mapInstanceRef.current = map;

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('auxclick', handleAuxClick);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Theme Accent Colors
  const getThemeAccent = (theme: MapTheme) => {
    switch (theme) {
      case 'MIDNIGHT_BLUE':
        return { primary: '#38bdf8', secondary: '#818cf8', available: '#38bdf8', beam: 'rgba(56, 189, 248, 0.9)' };
      case 'MATRIX_EMERALD':
        return { primary: '#10b981', secondary: '#34d399', available: '#10b981', beam: 'rgba(16, 185, 129, 0.9)' };
      case 'OLED_MONOCHROME':
        return { primary: '#ffffff', secondary: '#94a3b8', available: '#ffffff', beam: 'rgba(255, 255, 255, 0.9)' };
      case 'CYBER_DARK':
      default:
        return { primary: '#00f2fe', secondary: '#3b82f6', available: '#00f0aa', beam: 'rgba(0, 242, 254, 0.9)' };
    }
  };

  const currentAccent = getThemeAccent(mapTheme);

  // Real-Time User GPS Location Beacon & Auto-Center on Startup
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      if (!hasAutoCenteredRef.current) {
        hasAutoCenteredRef.current = true;
        map.flyTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 15.5,
          pitch: 52,
          bearing: -15,
          duration: 1800,
          essential: true
        });
      }

      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
      } else {
        const userEl = document.createElement('div');
        userEl.className = 'relative flex items-center justify-center';
        userEl.innerHTML = `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0; border-radius: 50%; background: ${currentAccent.primary}33; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: ${currentAccent.primary}55; border: 1.5px solid ${currentAccent.primary}; box-shadow: 0 0 15px ${currentAccent.primary};"></div>
            <div style="position: relative; width: 10px; height: 10px; border-radius: 50%; background: #ffffff; box-shadow: 0 0 8px #ffffff;"></div>
          </div>
        `;

        const userMarker = new maplibregl.Marker({ element: userEl })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map);

        userMarkerRef.current = userMarker;
      }
    }
  }, [userLocation, mapTheme]);

  // Handle Search Target (Enter Address Search FlyTo)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !searchTarget) return;

    map.flyTo({
      center: [searchTarget.lng, searchTarget.lat],
      zoom: 15.5,
      pitch: 52,
      bearing: -15,
      duration: 1800,
      essential: true
    });

    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }

    const searchEl = document.createElement('div');
    searchEl.className = 'relative flex flex-col items-center';
    searchEl.innerHTML = `
      <div style="
        background: rgba(13, 21, 39, 0.95);
        border: 1.5px solid ${currentAccent.primary};
        color: #ffffff;
        padding: 4px 10px;
        border-radius: 12px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 700;
        box-shadow: 0 0 20px ${currentAccent.primary}cc;
        white-space: nowrap;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        <span style="color: ${currentAccent.primary};">📍</span>
        <span>${searchTarget.name.split(',')[0]}</span>
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid ${currentAccent.primary};
      "></div>
    `;

    const marker = new maplibregl.Marker({ element: searchEl, anchor: 'bottom' })
      .setLngLat([searchTarget.lng, searchTarget.lat])
      .addTo(map);

    searchMarkerRef.current = marker;
  }, [searchTarget, mapTheme]);

  // Update Property Markers and Beams
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    filteredProperties.forEach((prop: Property) => {
      const isSelected = selectedProperty?.id === prop.id;
      const isFeatured = prop.featured;

      let statusColor = currentAccent.available;
      let statusBorder = `${currentAccent.available}88`;
      let statusBg = 'rgba(13, 21, 39, 0.94)';

      if (prop.status === 'RESERVADO') {
        statusColor = '#f59e0b';
        statusBorder = 'rgba(245, 158, 11, 0.6)';
      } else if (prop.status === 'EM NEGOCIAÇÃO') {
        statusColor = '#a855f7';
        statusBorder = 'rgba(168, 85, 247, 0.6)';
      } else if (prop.status === 'ALUGADO') {
        statusColor = '#ef4444';
        statusBorder = 'rgba(239, 68, 68, 0.6)';
      }

      const formattedPrice = `R$ ${prop.rentPrice.toLocaleString('pt-BR')}`;

      const el = document.createElement('div');
      el.className = 'custom-price-marker group';
      el.style.position = 'relative';

      const beamHtml = (mapVisualMode === 'BEAMS_3D' || isSelected) && isFeatured ? `
        <div class="light-beam-cylinder" style="
          left: 50%;
          bottom: 12px;
          background: linear-gradient(to top, ${statusColor}99 0%, ${statusColor}33 50%, transparent 100%);
          filter: drop-shadow(0 0 16px ${statusColor});
        "></div>
      ` : '';

      const heatHtml = mapVisualMode === 'HEATMAP' ? `
        <div style="
          position: absolute;
          width: ${Math.max(120, prop.demandScore * 2)}px;
          height: ${Math.max(120, prop.demandScore * 2)}px;
          border-radius: 50%;
          background: radial-gradient(circle, ${prop.demandScore > 90 ? 'rgba(239,68,68,0.55)' : prop.demandScore > 80 ? 'rgba(245,158,11,0.5)' : `${currentAccent.primary}66`} 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          filter: blur(8px);
        "></div>
      ` : '';

      el.innerHTML = `
        ${heatHtml}
        ${beamHtml}
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: ${statusBg};
          border: 1.5px solid ${isSelected ? currentAccent.primary : statusBorder};
          border-radius: 9999px;
          backdrop-filter: blur(14px);
          box-shadow: ${isSelected ? `0 0 25px ${currentAccent.primary}ee, 0 4px 15px rgba(0,0,0,0.8)` : '0 4px 14px rgba(0,0,0,0.6)'};
          transition: all 0.2s ease;
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          cursor: pointer;
        ">
          <span style="
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: ${statusColor};
            box-shadow: 0 0 8px ${statusColor};
            display: inline-block;
          "></span>
          <span style="
            font-family: 'JetBrains Mono', monospace;
            font-weight: 800;
            font-size: 11px;
            color: #ffffff;
            letter-spacing: -0.02em;
          ">${formattedPrice}</span>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid ${isSelected ? currentAccent.primary : statusBorder};
          margin-top: -1px;
        "></div>
        <div style="
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${statusColor};
          box-shadow: 0 0 10px ${statusColor};
          margin-top: 2px;
        "></div>
      `;

      el.addEventListener('click', () => {
        setSelectedProperty(prop);
        map.flyTo({
          center: [prop.longitude, prop.latitude],
          zoom: 15.5,
          pitch: 55,
          bearing: -15,
          duration: 1600,
          essential: true
        });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([prop.longitude, prop.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [filteredProperties, selectedProperty, mapVisualMode, mapTheme, setSelectedProperty]);

  // Center on selected property if changed from outside
  useEffect(() => {
    if (selectedProperty && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [selectedProperty.longitude, selectedProperty.latitude],
        zoom: 15.5,
        pitch: 55,
        duration: 1600,
        essential: true
      });
    }
  }, [selectedProperty]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleCenterUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15.5,
        pitch: 52,
        bearing: -18,
        duration: 1600
      });
    } else {
      requestUserLocation();
    }
  };

  const handleToggle3D = () => {
    if (!mapInstanceRef.current) return;
    const next3D = !is3DView;
    setIs3DView(next3D);
    mapInstanceRef.current.easeTo({
      pitch: next3D ? 52 : 0,
      bearing: next3D ? -18 : 0,
      duration: 1000
    });
  };

  const handleRotate = () => {
    if (!mapInstanceRef.current) return;
    const currentBearing = mapInstanceRef.current.getBearing();
    mapInstanceRef.current.easeTo({
      bearing: currentBearing + 45,
      duration: 800
    });
  };

  // Dynamic Theme Background Overlay Class
  const themeBgMap: Record<MapTheme, string> = {
    CYBER_DARK: 'bg-[#080d1a]',
    MIDNIGHT_BLUE: 'bg-[#050c24] saturate-150',
    MATRIX_EMERALD: 'bg-[#02130b] hue-rotate-[90deg]',
    OLED_MONOCHROME: 'bg-[#000000] grayscale'
  };

  const themeBgClass = themeBgMap[mapTheme] || 'bg-[#080d1a]';

  return (
    <div className={`relative w-full h-full flex-1 overflow-hidden transition-all duration-700 ${themeBgClass} map-theme-${mapTheme}`}>
      {/* Dynamic Map Tiles Shader CSS */}
      <style>{`
        .map-theme-CYBER_DARK .maplibregl-canvas {
          filter: brightness(0.95) contrast(1.15) saturate(1.2);
          transition: filter 0.5s ease;
        }
        .map-theme-MIDNIGHT_BLUE .maplibregl-canvas {
          filter: hue-rotate(210deg) saturate(2.8) brightness(0.85) contrast(1.4);
          transition: filter 0.5s ease;
        }
        .map-theme-MATRIX_EMERALD .maplibregl-canvas {
          filter: hue-rotate(95deg) saturate(3.5) brightness(0.9) contrast(1.45);
          transition: filter 0.5s ease;
        }
        .map-theme-OLED_MONOCHROME .maplibregl-canvas {
          filter: grayscale(100%) brightness(0.75) contrast(2.2);
          transition: filter 0.5s ease;
        }
      `}</style>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Futuristic HUD Grid overlay */}
      <div className="absolute inset-0 pointer-events-none hud-grid-bg opacity-15 z-10" />

      {/* Floating HUD Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenterUser={handleCenterUser}
        onToggle3D={handleToggle3D}
        onRotate={handleRotate}
        is3DView={is3DView}
        isLocating={isLocating}
        hasUserLocation={Boolean(userLocation)}
        propertiesCount={filteredProperties.length}
        mapVisualMode={mapVisualMode}
        setMapVisualMode={setMapVisualMode}
        mapTheme={mapTheme}
        setMapTheme={setMapTheme}
      />
    </div>
  );
};
