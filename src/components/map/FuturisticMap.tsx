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

  // Generate Tile Specification for Cyber Dark, Cyber Light, or Hybrid Satellite
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
            maxzoom: 17, // MapLibre will automatically overzoom smoothly past zoom 17
            attribution: '&copy; Esri &copy; Maxar &copy; Earthstar Geographics'
          },
          'satellite-labels': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}@2x.png',
              'https://d.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}@2x.png'
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
            id: 'satellite-street-labels',
            type: 'raster',
            source: 'satellite-labels',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      };
    }

    const isLight = theme === 'CYBER_LIGHT';
    const tileType = isLight ? 'light_all' : 'dark_all';

    return {
      version: 8,
      sources: {
        'carto-tiles': {
          type: 'raster',
          tiles: [
            `https://a.basemaps.cartocdn.com/${tileType}/{z}/{x}/{y}@2x.png`,
            `https://b.basemaps.cartocdn.com/${tileType}/{z}/{x}/{y}@2x.png`,
            `https://c.basemaps.cartocdn.com/${tileType}/{z}/{x}/{y}@2x.png`,
            `https://d.basemaps.cartocdn.com/${tileType}/{z}/{x}/{y}@2x.png`
          ],
          tileSize: 256,
          maxzoom: 18,
          attribution: '&copy; OpenStreetMap &copy; CARTO'
        }
      },
      layers: [
        {
          id: 'carto-layer',
          type: 'raster',
          source: 'carto-tiles',
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
      maxZoom: 18.2, // Clean max zoom without tile limits
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
            <div style="position: absolute; inset: 0; border-radius: 50%; background: ${currentAccent.radarColor}44; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: ${currentAccent.radarColor}66; border: 2px solid ${currentAccent.radarColor}; box-shadow: 0 0 15px ${currentAccent.radarColor};"></div>
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
      el.style.position = 'relative';

      const beamHtml = (mapVisualMode === 'BEAMS_3D' || isSelected) && isFeatured ? `
        <div class="light-beam-cylinder" style="
          left: 50%;
          bottom: 12px;
          background: linear-gradient(to top, ${statusColor}cc 0%, ${statusColor}33 50%, transparent 100%);
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
          box-shadow: ${isSelected 
            ? `0 0 25px ${currentAccent.primary}ee, 0 4px 15px rgba(0,0,0,0.4)` 
            : isLight ? '0 4px 14px rgba(0,0,0,0.12), 0 0 10px rgba(2,132,199,0.15)' : '0 4px 14px rgba(0,0,0,0.7)'};
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
            color: ${textColor};
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
