import React, { useState } from 'react';
import { useApp, calculateDistanceKm } from '../context/AppContext';
import { LeafletBusMap } from '../components/common/LeafletBusMap';

interface StudentDashboardProps {
  onOpenAuth: (mode?: 'signin' | 'register') => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenAuth }) => {
  const {
    user,
    buses,
    drivers,
    routes,
    busLocations,
    activeBusId,
    setActiveBusId,
    selectedStopId,
    setSelectedStopId,
    notifications,
    resetDefaultFleet,
    isSimulationPlaying,
    toggleSimulationPlay,
    simulationSpeed,
    setSimulationSpeed,
    driverGpsActive,
    driverGpsStatus,
    driverGpsError,
    startDriverRealGps,
    stopDriverRealGps,
  } = useApp();

  const [busSearch, setBusSearch] = useState('');
  const [trackingMode, setTrackingMode] = useState<'single' | 'all'>('single');

  const hasBuses = buses.length > 0;

  // Active tracked bus (safe fallback)
  const activeBus = buses.find((b) => b.id === activeBusId) || buses[0] || null;
  const activeRoute = activeBus
    ? routes.find((r) => r.id === activeBus.routeId) || routes[0]
    : routes[0];
  const activeDriver = activeBus
    ? drivers.find((d) => d.id === activeBus.driverId) || drivers[0]
    : drivers[0];
  const activeLocation = activeBus ? busLocations[activeBus.id] : null;

  // Selected stop
  const currentStop =
    activeRoute.stops.find((s) => s.id === selectedStopId) ||
    activeRoute.stops.find((s) => s.id === user?.assignedStopId) ||
    activeRoute.stops[2] ||
    activeRoute.stops[0];

  // Calculate live distance & ETA to the selected stop
  let distanceKm = 0;
  let etaMinutes = 0;

  if (activeLocation && currentStop) {
    distanceKm = calculateDistanceKm(
      activeLocation.latitude,
      activeLocation.longitude,
      currentStop.coordinates[0],
      currentStop.coordinates[1]
    );

    // Approximate ETA based on current speed or standard city speed 30km/h
    const effectiveSpeed = activeLocation.speedKmH > 10 ? activeLocation.speedKmH : 28;
    etaMinutes = Math.max(1, Math.round((distanceKm / effectiveSpeed) * 60));
  }

  // Filtered buses list for switcher
  const filteredBuses = buses.filter(
    (b) =>
      b.busNumber.toLowerCase().includes(busSearch.toLowerCase()) ||
      b.registrationNumber.toLowerCase().includes(busSearch.toLowerCase())
  );

  // Time since last GPS update
  const secondsAgo = activeLocation
    ? Math.max(1, Math.floor((Date.now() - activeLocation.timestamp) / 1000))
    : 0;

  const relevantNotifications = notifications.filter(
    (n) => !n.targetBusId || (activeBus && n.targetBusId === activeBus.id)
  );

  const handleDeviceGpsToggle = () => {
    if (!activeBus) return;
    if (driverGpsActive) {
      stopDriverRealGps();
    } else {
      startDriverRealGps(activeBus.id);
    }
  };

  // If all buses were removed
  if (!hasBuses || !activeBus) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-2xl mx-auto space-y-5">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-4xl shadow-sm">
            🚌
          </div>
          <div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              Fleet Status: 0 Buses Active
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">
              All Buses Removed from Live Tracking
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              All transit shuttles were removed from the fleet system. To start live GPS tracking along the Sathyamangalam – Info Institute of Engineering route and other corridors, restore the standard college fleet with one click.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-left text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>📍 Available Pre-configured Corridors to Restore:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
              <li>Route 01: Sathyamangalam Bus Stand ➔ Info Institute of Engineering (46.5 km)</li>
              <li>Route 02: Gandhipuram Central Stand ➔ Info Institute of Engineering (18.5 km)</li>
              <li>Route 03: Tirupur Old Bus Stand ➔ Info Institute of Engineering (42.0 km)</li>
              <li>Route 04: Mettupalayam ➔ Info Institute of Engineering (34.5 km)</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={resetDefaultFleet}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Restore College Fleet & Start Tracking</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Student Profile & Quick Status Header Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Student Profile Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-blue-500/20">
              {user?.name ? user.name.charAt(0) : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  {user ? user.name : 'Guest Student'}
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  {user?.role ? user.role.toUpperCase() : 'STUDENT'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>{user?.collegeName || 'Info Institute of Engineering'}</span>
                {user?.studentId && (
                  <>
                    <span>·</span>
                    <span className="font-mono">{user.studentId}</span>
                  </>
                )}
                {user?.department && (
                  <>
                    <span>·</span>
                    <span>{user.department}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Key Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Assigned Shuttle</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {activeBus.busNumber}
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-medium">Your Boarding Stop</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px] mt-0.5" title={currentStop.name}>
                {currentStop.name}
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-medium">Estimated Arrival</div>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5 tabular-nums">
                ~{etaMinutes} min ({distanceKm} km)
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-medium">Telemetry Source</div>
              <div className="mt-0.5 flex items-center gap-1.5 font-semibold">
                {activeLocation?.isLiveGps ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    REAL GPS
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    DEMO SIMULATION
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proximity Approaching Alert Banner if within 2 km */}
      {distanceKm > 0 && distanceKm <= 2.5 && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 text-xs shadow-sm animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🔔</span>
            <div>
              <span className="font-bold">Shuttle Approaching Your Stop!</span> {activeBus.busNumber} is only{' '}
              <span className="font-mono font-bold">{distanceKm} km</span> away (~{etaMinutes} min). Please proceed to{' '}
              <span className="font-semibold">{currentStop.name}</span>.
            </div>
          </div>
          <span className="font-mono text-[10px] px-2 py-1 rounded bg-emerald-600 text-white font-bold shrink-0">
            ARRIVING SOON
          </span>
        </div>
      )}

      {/* Live Tracking Controls Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Map View:</span>
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setTrackingMode('single')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                trackingMode === 'single'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Selected Bus Route
            </button>
            <button
              onClick={() => setTrackingMode('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                trackingMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Fleet Radar ({buses.length})
            </button>
          </div>
        </div>

        {/* Center: Live Motion Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSimulationPlay}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
              isSimulationPlaying
                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title="Pause or resume live movement"
          >
            <span>{isSimulationPlaying ? '⏸ Pause Live Motion' : '▶ Play Live Motion'}</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <span className="text-[10px] text-slate-400 px-1 font-semibold">Speed:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-lg ${
                  simulationSpeed === spd
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Device GPS Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDeviceGpsToggle}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
              driverGpsActive
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            title="Connect your browser device geolocation API"
          >
            <span className={`w-2 h-2 rounded-full ${driverGpsActive ? 'bg-white animate-ping' : 'bg-slate-400'}`} />
            <span>{driverGpsActive ? 'Transmitting Real GPS' : 'Share Device GPS'}</span>
          </button>
        </div>
      </div>

      {driverGpsError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400">
          ⚠️ {driverGpsError}
        </div>
      )}

      {/* Corridor Quick Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 shrink-0 font-medium">Quick Corridors:</span>
        {routes.map((route) => {
          const isSelected = activeRoute.id === route.id;
          const matchingBus = buses.find((b) => b.routeId === route.id);
          return (
            <button
              key={route.id}
              onClick={() => {
                if (matchingBus) setActiveBusId(matchingBus.id);
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {route.routeNumber}: {route.routeName.split('–')[0]?.trim()} ➔ IIE
            </button>
          );
        })}
      </div>

      {/* Main Dashboard Layout: Map (Left/Center) + Detail Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map & Live Stop Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Map Header Card */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {trackingMode === 'single'
                      ? `Live Route: ${activeRoute.routeName}`
                      : 'Live Fleet Radar (All Active Campus Shuttles)'}
                  </h2>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Route {activeRoute.routeNumber} · {activeRoute.totalDistanceKm} km total · {activeRoute.stops.length} designated campus stops
                </div>
              </div>

              {/* Status pill & freshness */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-xl uppercase ${
                    activeBus.status === 'moving'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : activeBus.status === 'delayed'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {activeBus.status}
                </span>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`}
                </span>
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <LeafletBusMap
              route={trackingMode === 'single' ? activeRoute : undefined}
              bus={trackingMode === 'single' ? activeBus : undefined}
              busLocation={trackingMode === 'single' ? activeLocation ?? undefined : undefined}
              allBuses={buses}
              allLocations={busLocations}
              showAllBuses={trackingMode === 'all'}
              selectedStopId={currentStop.id}
              onSelectStop={(stopId) => setSelectedStopId(stopId)}
              heightClass="h-[480px]"
            />

            {/* Bottom Map Note on Demo vs Real GPS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Click any numbered stop marker on the map to switch your pickup location.</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {activeLocation?.isLiveGps
                  ? 'Transmitting real GPS from authorized device'
                  : 'Live simulation along designated highway corridor'}
              </div>
            </div>
          </div>

          {/* Route Stops Sequence Progression */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
              <span>Route Stops & Scheduled Arrival Times</span>
              <span className="text-xs font-normal text-slate-400">Select your stop below</span>
            </h3>

            <div className="space-y-3">
              {activeRoute.stops.map((stop, index) => {
                const isSelected = stop.id === currentStop.id;
                const isPassed = (activeLocation?.currentStopIndex ?? 0) > index;
                const isCurrent = (activeLocation?.currentStopIndex ?? 0) === index;

                return (
                  <div
                    key={stop.id}
                    onClick={() => setSelectedStopId(stop.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isPassed
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            : isCurrent
                            ? 'bg-emerald-600 text-white animate-pulse'
                            : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isPassed ? '✓' : index + 1}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{stop.name}</span>
                          {isSelected && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-600 text-white">
                              Selected Pickup
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                              Bus Near Stop
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {stop.landmark}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                        {stop.scheduledTime}
                      </div>
                      <div className="text-[10px] text-slate-400">Scheduled</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Driver Card, Bus Switcher & Alerts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Driver & Bus Specification Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assigned Driver & Vehicle</h3>

            {/* Driver Profile */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                {activeDriver.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {activeDriver.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {activeDriver.experienceYears} Years Exp · ★ {activeDriver.rating} Rating
                </div>
                <a
                  href={`tel:${activeDriver.phone}`}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{activeDriver.phone}</span>
                </a>
              </div>
            </div>

            {/* Bus Specs */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Bus Registration</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {activeBus.registrationNumber}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Vehicle Model</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{activeBus.model}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Fuel & Engine</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{activeBus.fuelType}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Current Speed</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {activeLocation?.speedKmH ?? 0} km/h
                </span>
              </div>
              <div className="py-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-500">Seating Capacity</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {activeBus.currentOccupancy} / {activeBus.capacity} seats occupied
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${(activeBus.currentOccupancy / activeBus.capacity) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Switch Bus Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Track Another Campus Bus</h3>

            <input
              type="text"
              value={busSearch}
              onChange={(e) => setBusSearch(e.target.value)}
              placeholder="Search other buses..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {filteredBuses.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setActiveBusId(b.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    b.id === activeBus.id
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 ring-1 ring-blue-500'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{b.busNumber}</div>
                    <div className="text-[10px] text-slate-400">{b.registrationNumber}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      b.status === 'moving'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                        : b.status === 'delayed'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {b.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Transit Alerts Feed */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Transit Advisories</h3>
            <div className="space-y-2.5">
              {relevantNotifications.length === 0 ? (
                <div className="text-xs text-slate-400 py-2">No active delay alerts. All shuttles running normally.</div>
              ) : (
                relevantNotifications.slice(0, 3).map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{n.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{n.createdAt}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
