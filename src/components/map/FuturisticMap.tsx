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
    searchTarget,
    currentUser,
    setIsAuthModalOpen
  } = useApp();
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const searchMarkerRef = useRef<maplibregl.Marker | null>(null);
  const hasAutoCenteredRef = useRef<boolean>(false);
  const [is3DView, setIs3DView] = useState(true);

  // Generate Tile Specification for Cyber Dark, Cyber Light, or Hybrid Satellite with Ultra-Bright White Labels
  const getStyleSpec = (theme: MapTheme): maplibregl.StyleSpecification => {
    if (theme === 'SATELLITE') {
      return {
        version: 8,
        sources: {
          'satellite-tiles': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            maxzoom: 17,
            attribution: '&copy; Esri &copy; Maxar &copy; Earthstar Geographics'
          },
          'bright-labels': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png',
              'https://d.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png'
            ],
            tileSize: 256,
            maxzoom: 18
          }
        },
        layers: [
          {
            id: 'satellite-base',
            type: 'raster',
            source: 'satellite-tiles',
            minzoom: 0,
            maxzoom: 22
          },
          {
            id: 'satellite-bright-street-labels',
            type: 'raster',
            source: 'bright-labels',
            minzoom: 0,
            maxzoom: 22,
            paint: {
              'raster-brightness-min': 0.2,
              'raster-contrast': 0.3
            }
          }
        ]
      };
    }

    if (theme === 'CYBER_DARK') {
      return {
        version: 8,
        sources: {
          'google-dark-tiles': {
            type: 'raster',
            tiles: [
              'https://mt0.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}',
              'https://mt1.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}',
              'https://mt2.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}',
              'https://mt3.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}'
            ],
            tileSize: 256,
            maxzoom: 21,
            attribution: '&copy; Google Maps'
          }
        },
        layers: [
          {
            id: 'google-dark-layer',
            type: 'raster',
            source: 'google-dark-tiles',
            minzoom: 0,
            maxzoom: 22,
            paint: {
              'raster-brightness-max': 0.35,
              'raster-brightness-min': 0.03,
              'raster-contrast': 0.60,
              'raster-saturation': 0.20,
              'raster-hue-rotate': 195
            }
          }
        ]
      };
    }

    // CYBER_LIGHT (Google Maps Roadmap HD: Crisp White Streets, Blue/Steel Highways, Clean Gray Background & Rich Points of Interest)
    return {
      version: 8,
      sources: {
        'google-roadmap-tiles': {
          type: 'raster',
          tiles: [
            'https://mt0.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}',
            'https://mt1.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}',
            'https://mt2.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}',
            'https://mt3.google.com/vt/lyrs=m&hl=pt-BR&x={x}&y={y}&z={z}'
          ],
          tileSize: 256,
          maxzoom: 21,
          attribution: '&copy; Google Maps'
        }
      },
      layers: [
        {
          id: 'google-roadmap-layer',
          type: 'raster',
          source: 'google-roadmap-tiles',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    };
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
      style: getStyleSpec(mapTheme),
      center: initialCenter,
      zoom: userLocation ? 15.5 : 13.8,
      minZoom: 2,
      maxZoom: 18.2,
      pitch: 0, // Flat 2D Top-Down View by default for 100% precision
      bearing: 0,
      dragRotate: true,
      touchPitch: true,
      attributionControl: false
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    // Enable all native MapLibre rotation and pitch handlers
    map.dragRotate.enable();
    map.touchPitch.enable();
    map.touchZoomRotate.enable();
    map.touchZoomRotate.enableRotation();

    // Middle Mouse Button (Scroll Button) & Right-Click Drag Rotation & Pitch
    let isMiddleDragging = false;
    let startX = 0;
    let startY = 0;
    let startBearing = 0;
    let startPitch = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        e.stopPropagation();
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
      e.stopPropagation();
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newBearing = startBearing + deltaX * 0.45;
      const newPitch = Math.min(Math.max(startPitch - deltaY * 0.35, 0), 80);

      map.setBearing(newBearing);
      map.setPitch(newPitch);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isMiddleDragging) {
        isMiddleDragging = false;
        container.style.cursor = '';
      }
    };

    const handleAuxClick = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Support Shift + Scroll Wheel for direct Bearing Rotation
    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey) {
        e.preventDefault();
        const currentBearing = map.getBearing();
        map.setBearing(currentBearing + (e.deltaY > 0 ? 10 : -10));
      } else if (e.altKey) {
        e.preventDefault();
        const currentPitch = map.getPitch();
        map.setPitch(Math.min(Math.max(currentPitch + (e.deltaY > 0 ? -6 : 6), 0), 80));
      }
    };

    const canvas = map.getCanvas();
    const canvasContainer = map.getCanvasContainer();

    // Attach listeners directly to canvas, container, and window
    canvas.addEventListener('mousedown', handleMouseDown, { capture: true });
    canvasContainer.addEventListener('mousedown', handleMouseDown, { capture: true });
    container.addEventListener('mousedown', handleMouseDown, { capture: true });
    canvas.addEventListener('auxclick', handleAuxClick, { capture: true });
    container.addEventListener('auxclick', handleAuxClick, { capture: true });
    canvas.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    window.addEventListener('mousemove', handleMouseMove, { capture: true });
    window.addEventListener('mouseup', handleMouseUp, { capture: true });

    // 2.5km Visible Screen Radius Zoom Rule (Zoom >= 14.0)
    const BEAM_ZOOM_THRESHOLD = 14.0;
    const updateBeamZoomClass = () => {
      const isCloseEnough = map.getZoom() >= BEAM_ZOOM_THRESHOLD;
      container.classList.toggle('beams-zoom-active', isCloseEnough);
    };

    map.on('zoom', updateBeamZoomClass);
    map.on('render', updateBeamZoomClass);
    updateBeamZoomClass();

    mapInstanceRef.current = map;

    const handleWindowResize = () => {
      map.resize();
    };

    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown, { capture: true } as any);
      canvasContainer.removeEventListener('mousedown', handleMouseDown, { capture: true } as any);
      container.removeEventListener('mousedown', handleMouseDown, { capture: true } as any);
      canvas.removeEventListener('auxclick', handleAuxClick, { capture: true } as any);
      container.removeEventListener('auxclick', handleAuxClick, { capture: true } as any);
      canvas.removeEventListener('wheel', handleWheel, { capture: true } as any);
      window.removeEventListener('mousemove', handleMouseMove, { capture: true } as any);
      window.removeEventListener('mouseup', handleMouseUp, { capture: true } as any);
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
      map.off('zoom', updateBeamZoomClass);
      map.off('render', updateBeamZoomClass);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Dynamically update map style when switching theme
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setStyle(getStyleSpec(mapTheme));
  }, [mapTheme]);

  // Theme Accent Palette
  const isLight = mapTheme === 'CYBER_LIGHT';
  const isSat = mapTheme === 'SATELLITE';

  const currentAccent = isLight ? {
    primary: '#0284c7',
    secondary: '#7c3aed',
    available: '#059669',
    availableBg: 'rgba(255, 255, 255, 0.96)',
    textColor: '#0f172a',
    beam: 'rgba(2, 132, 199, 0.85)',
    radarColor: '#0284c7'
  } : isSat ? {
    primary: '#00f2fe',
    secondary: '#f59e0b',
    available: '#00f0aa',
    availableBg: 'rgba(5, 10, 25, 0.94)',
    textColor: '#ffffff',
    beam: 'rgba(0, 242, 254, 0.95)',
    radarColor: '#00f2fe'
  } : {
    primary: '#00f2fe',
    secondary: '#3b82f6',
    available: '#00f0aa',
    availableBg: 'rgba(13, 21, 39, 0.94)',
    textColor: '#ffffff',
    beam: 'rgba(0, 242, 254, 0.9)',
    radarColor: '#00f2fe'
  };

  // Real-Time User GPS Location Beacon (Updates user marker without moving camera)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    } else {
      const userEl = document.createElement('div');
      userEl.className = 'flex items-center justify-center';
      userEl.innerHTML = `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; border-radius: 50%; background: ${currentAccent.radarColor}44; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: ${currentAccent.radarColor}66; border: 2px solid ${currentAccent.radarColor}; box-shadow: 0 0 15px ${currentAccent.radarColor};"></div>
          <div style="position: relative; width: 10px; height: 10px; border-radius: 50%; background: #ffffff; box-shadow: 0 0 8px #ffffff;"></div>
        </div>
      `;

      const userMarker = new maplibregl.Marker({ element: userEl, anchor: 'center' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);

      userMarkerRef.current = userMarker;
    }
  }, [userLocation, mapTheme]);

  // Handle Search Target (Enter Address Search FlyTo)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !searchTarget) return;

    map.flyTo({
      center: [searchTarget.lng, searchTarget.lat],
      zoom: 16,
      duration: 1500,
      essential: true
    });

    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }

    const searchEl = document.createElement('div');
    searchEl.className = 'flex flex-col items-center';
    searchEl.innerHTML = `
      <div style="
        background: ${isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(13, 21, 39, 0.95)'};
        border: 1.5px solid ${currentAccent.primary};
        color: ${isLight ? '#0f172a' : '#ffffff'};
        padding: 4px 10px;
        border-radius: 12px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 800;
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

  // Auto-pitch camera into 3D angle when activating BEAMS_3D mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (mapVisualMode === 'BEAMS_3D') {
      map.easeTo({
        pitch: 60,
        duration: 1200,
        essential: true
      });
    }
  }, [mapVisualMode]);

  // Update Property Markers, Beams, and Anti-Collision Spider-Declutter
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Render each property at its EXACT registered geographic coordinate with rock-solid ground anchor
    filteredProperties.forEach((prop: Property, idx: number) => {
      const latNum = Number(prop.latitude);
      const lngNum = Number(prop.longitude);
      if (isNaN(latNum) || isNaN(lngNum)) return;

      const isSelected = selectedProperty?.id === prop.id;
      const isFeatured = prop.featured;

      let statusColor = currentAccent.available;
      let statusBorder = `${currentAccent.available}88`;
      let statusBg = currentAccent.availableBg;
      let textColor = currentAccent.textColor;

      if (prop.status === 'RESERVADO') {
        statusColor = '#f59e0b';
        statusBorder = 'rgba(245, 158, 11, 0.7)';
      } else if (prop.status === 'EM NEGOCIAÇÃO') {
        statusColor = isLight ? '#7c3aed' : '#a855f7';
        statusBorder = isLight ? 'rgba(124, 58, 237, 0.7)' : 'rgba(168, 85, 247, 0.7)';
      } else if (prop.status === 'ALUGADO') {
        statusColor = '#ef4444';
        statusBorder = 'rgba(239, 68, 68, 0.7)';
      }

      const formattedPrice = `R$ ${prop.rentPrice.toLocaleString('pt-BR')}`;

      const el = document.createElement('div');
      el.className = 'custom-price-marker group';
      el.style.display = 'inline-flex';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'center';
      el.style.width = 'max-content';
      el.style.position = 'relative';
      el.style.cursor = 'pointer';
      el.style.userSelect = 'none';
      el.style.zIndex = isSelected ? '100' : `${30 + idx}`;

      const showBeam = mapVisualMode === 'BEAMS_3D';

      const beamHtml = showBeam ? `
        <div class="hologram-3d-beacon" style="
          --beam-color: ${statusColor};
          --beam-color-trans: ${statusColor}cc;
          --beam-color-fade: ${statusColor}33;
          position: absolute;
          bottom: 0px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        ">
          <div class="beam-cylinder-body">
            <div class="beam-laser-core"></div>
          </div>
          <div class="beam-ground-base">
            <div class="beam-ground-glow-disk"></div>
            <div class="beam-windows-spinner"></div>
            <div class="beam-ground-dot"></div>
          </div>
        </div>
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

        <!-- 1. Price Badge Pill firmly anchored -->
        <div style="
          position: relative;
          z-index: 25;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3.5px 10px;
          background: ${isLight ? '#ffffff' : statusBg};
          border: 1.5px solid ${isSelected ? currentAccent.primary : isLight ? '#cbd5e1' : statusBorder};
          border-radius: 9999px;
          backdrop-filter: blur(12px);
          box-shadow: ${isSelected 
            ? `0 0 20px ${currentAccent.primary}ee, 0 4px 14px rgba(0,0,0,0.6)` 
            : isLight ? '0 4px 14px rgba(15,23,42,0.18), 0 1px 2px rgba(15,23,42,0.08)' : '0 4px 12px rgba(0,0,0,0.8)'};
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
          transform: ${isSelected ? 'scale(1.12)' : 'scale(1)'};
          white-space: nowrap;
        " class="hover:scale-110">
          <span style="
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: ${statusColor};
            box-shadow: 0 0 6px ${statusColor};
            display: inline-block;
            flex-shrink: 0;
          "></span>
          <span style="
            font-family: 'JetBrains Mono', monospace;
            font-weight: 800;
            font-size: 11px;
            color: ${textColor};
            letter-spacing: -0.02em;
          ">${formattedPrice}</span>
        </div>

        <!-- 2. Downward Pin Arrow Tip touching the exact street coordinate -->
        <div style="
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid ${isSelected ? currentAccent.primary : isLight ? '#cbd5e1' : statusBorder};
          margin-top: -1px;
          z-index: 24;
        "></div>
      `;

      // Elevate z-index on mouse hover
      el.addEventListener('mouseenter', () => {
        el.style.zIndex = '9999';
      });
      el.addEventListener('mouseleave', () => {
        el.style.zIndex = isSelected ? '100' : `${30 + idx}`;
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();

        map.flyTo({
          center: [lngNum, latNum],
          zoom: 16.5,
          duration: 1000,
          essential: true
        });

        if (!currentUser) {
          setIsAuthModalOpen(true);
        } else {
          setSelectedProperty(prop);
        }
      });

      const marker = new maplibregl.Marker({ 
        element: el, 
        anchor: 'bottom'
      })
        .setLngLat([lngNum, latNum])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [filteredProperties, selectedProperty, mapVisualMode, mapTheme, setSelectedProperty, currentUser, setIsAuthModalOpen]);

  // Center on selected property if changed from outside
  useEffect(() => {
    if (selectedProperty && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [selectedProperty.longitude, selectedProperty.latitude],
        zoom: 16.5,
        duration: 1200,
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

  const themeBgClass = isLight ? 'bg-[#f1f5f9]' : 'bg-[#080d1a]';

  return (
    <div className={`relative w-full h-full flex-1 overflow-hidden transition-all duration-700 ${themeBgClass}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Futuristic HUD Grid overlay */}
      <div className={`absolute inset-0 pointer-events-none hud-grid-bg ${isLight ? 'opacity-5' : 'opacity-15'} z-10`} />

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
