import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Bus, BusLocation, Route } from '../../types';

interface LeafletBusMapProps {
  route?: Route;
  bus?: Bus;
  busLocation?: BusLocation;
  allBuses?: Bus[];
  allLocations?: Record<string, BusLocation>;
  selectedStopId?: string;
  onSelectStop?: (stopId: string) => void;
  showAllBuses?: boolean;
  heightClass?: string;
}

export const LeafletBusMap: React.FC<LeafletBusMapProps> = ({
  route,
  bus,
  busLocation,
  allBuses = [],
  allLocations = {},
  selectedStopId,
  onSelectStop,
  showAllBuses = false,
  heightClass = 'h-[500px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center around Sathyamangalam - Info Institute of Engineering corridor
      const defaultCenter: [number, number] = route?.stops[0]?.coordinates || [11.2330, 77.1080];

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 11,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Clean bottom-right zoom control
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Route Polyline & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Draw Route Polyline if single route selected
    if (route && route.pathCoordinates.length > 0) {
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
      }

      const polyline = L.polyline(route.pathCoordinates, {
        color: '#2563EB',
        weight: 5,
        opacity: 0.85,
        dashArray: undefined,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(markersGroup);

      routeLayerRef.current = polyline;

      // Draw stops
      route.stops.forEach((stop, index) => {
        const isSelected = stop.id === selectedStopId;
        const isTerminal = index === route.stops.length - 1;

        const stopIconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
            ${
              isSelected
                ? '<div class="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping"></div>'
                : ''
            }
            <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 font-bold text-xs ${
              isTerminal
                ? 'bg-amber-500 text-white border-white'
                : isSelected
                ? 'bg-blue-600 text-white border-white scale-110 ring-2 ring-blue-400'
                : 'bg-white text-slate-800 border-blue-600'
            }">
              ${isTerminal ? '★' : index + 1}
            </div>
            <div class="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded shadow-sm text-[11px] font-semibold ${
              isSelected ? 'bg-blue-900 text-white' : 'bg-slate-900/80 text-white backdrop-blur-xs'
            }">
              ${stop.name}
            </div>
          </div>
        `;

        const stopIcon = L.divIcon({
          html: stopIconHtml,
          className: 'custom-stop-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const stopMarker = L.marker(stop.coordinates, { icon: stopIcon }).addTo(markersGroup);

        stopMarker.on('click', () => {
          if (onSelectStop) onSelectStop(stop.id);
        });

        stopMarker.bindPopup(`
          <div class="p-1 text-slate-900">
            <div class="text-xs font-semibold text-blue-600 uppercase tracking-wide">Stop #${index + 1}</div>
            <div class="text-sm font-bold">${stop.name}</div>
            <div class="text-xs text-slate-500 mt-0.5">${stop.landmark}</div>
            <div class="text-xs font-mono font-medium text-slate-700 mt-1">Scheduled: ${stop.scheduledTime}</div>
          </div>
        `);
      });
    }

    // 2. Render Single Bus or Multi-Buses
    if (showAllBuses && allBuses.length > 0) {
      allBuses.forEach((b) => {
        const loc = allLocations[b.id];
        if (!loc) return;
        renderBusMarker(b, loc, markersGroup);
      });
    } else if (bus && busLocation) {
      renderBusMarker(bus, busLocation, markersGroup);
    }
  }, [route, bus, busLocation, allBuses, allLocations, selectedStopId, showAllBuses]);

  // Helper to render bus marker with heading, pulse & status
  const renderBusMarker = (b: Bus, loc: BusLocation, group: L.LayerGroup) => {
    const isLive = loc.isLiveGps;
    const isMoving = b.status === 'moving';
    const isDelayed = b.status === 'delayed';

    let markerColor = 'bg-blue-600';
    let pulseColor = 'bg-blue-400';
    let statusText = 'Normal';

    if (isDelayed) {
      markerColor = 'bg-amber-500';
      pulseColor = 'bg-amber-300';
      statusText = 'Delayed';
    } else if (b.status === 'stopped') {
      markerColor = 'bg-indigo-600';
      pulseColor = 'bg-indigo-300';
      statusText = 'At Stop';
    } else if (b.status === 'offline') {
      markerColor = 'bg-slate-500';
      pulseColor = 'bg-slate-300';
      statusText = 'Offline';
    }

    const busIconHtml = `
      <div class="relative flex items-center justify-center cursor-pointer">
        ${isMoving ? `<div class="custom-bus-pulse ${pulseColor}"></div>` : ''}
        <div class="w-11 h-11 rounded-full ${markerColor} text-white flex flex-col items-center justify-center shadow-xl border-2 border-white transition-transform duration-300" style="transform: rotate(${loc.headingDeg}deg)">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h8m-8 4h8m-9 9h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zm1-2a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/>
          </svg>
        </div>
        <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded shadow-md text-[10px] font-bold text-white whitespace-nowrap ${
          isLive ? 'bg-emerald-600' : 'bg-slate-900/90'
        }">
          ${b.busNumber} · ${loc.speedKmH} km/h
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: busIconHtml,
      className: 'custom-bus-icon-container',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(group);

    const telemetryBadge = isLive
      ? '<span class="inline-flex items-center text-xs font-semibold text-emerald-600">● REAL GPS DEVICE</span>'
      : '<span class="inline-flex items-center text-xs font-semibold text-amber-600">⚡ DEMO SIMULATION</span>';

    marker.bindPopup(`
      <div class="p-2 min-w-[200px] text-slate-900">
        <div class="flex items-center justify-between pb-1 border-b border-slate-200">
          <span class="font-bold text-base text-slate-900">${b.busNumber}</span>
          ${telemetryBadge}
        </div>
        <div class="mt-2 text-xs text-slate-600 space-y-1">
          <div><span class="font-semibold text-slate-700">Reg No:</span> ${b.registrationNumber}</div>
          <div><span class="font-semibold text-slate-700">Status:</span> ${statusText}</div>
          <div><span class="font-semibold text-slate-700">Speed:</span> ${loc.speedKmH} km/h</div>
          <div><span class="font-semibold text-slate-700">Occupancy:</span> ${b.currentOccupancy}/${b.capacity} seats</div>
          <div class="text-[11px] text-slate-500 mt-1.5 pt-1 border-t border-slate-100">${loc.statusMessage || ''}</div>
        </div>
      </div>
    `);
  };

  // Recenter helper
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (busLocation) {
      map.flyTo([busLocation.latitude, busLocation.longitude], 15, { duration: 1 });
    } else if (route && route.pathCoordinates.length > 0) {
      const bounds = L.latLngBounds(route.pathCoordinates);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (route && route.pathCoordinates.length > 0) {
      const bounds = L.latLngBounds(route.pathCoordinates);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (allBuses.length > 0) {
      const points = allBuses
        .map((b) => allLocations[b.id])
        .filter(Boolean)
        .map((loc) => [loc.latitude, loc.longitude] as [number, number]);
      if (points.length > 0) {
        map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
      }
    }
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900 ${heightClass}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Floating Quick Action Bar */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          title="Recenter on Bus"
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v3m0 14v3m10-10h-3M5 12H2" />
          </svg>
        </button>

        <button
          onClick={handleFitBounds}
          title="Fit Route in View"
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Floating GPS Telemetry Indicator */}
      <div className="absolute top-4 left-4 z-20">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border border-slate-200 dark:border-slate-700 text-xs">
          {busLocation?.isLiveGps ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE GPS ACTIVE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>DEMO SIMULATION</span>
            </div>
          )}
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-slate-600 dark:text-slate-300 font-mono tabular-nums">
            {busLocation ? `${busLocation.speedKmH} km/h` : 'Standby'}
          </span>
        </div>
      </div>
    </div>
  );
};
