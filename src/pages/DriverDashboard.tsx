import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const DriverDashboard: React.FC = () => {
  const {
    user,
    buses,
    routes,
    busLocations,
    driverGpsActive,
    driverGpsStatus,
    driverGpsError,
    startDriverRealGps,
    stopDriverRealGps,
    startTrip,
    endTrip,
    advanceNextStop,
    reportIssue,
    resetDefaultFleet,
  } = useApp();

  const [selectedBusId, setSelectedBusId] = useState<string>(
    user?.assignedBusId || buses[0]?.id || ''
  );
  const [customDelayReason, setCustomDelayReason] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);

  const currentBus = buses.find((b) => b.id === selectedBusId) || buses[0] || null;
  const currentRoute = currentBus ? routes.find((r) => r.id === currentBus.routeId) || routes[0] : routes[0];
  const currentLocation = currentBus ? busLocations[currentBus.id] : null;

  const isTripActive = currentBus ? (currentBus.status === 'moving' || currentBus.status === 'delayed') : false;

  const handleToggleGps = () => {
    if (!currentBus) return;
    if (driverGpsActive) {
      stopDriverRealGps();
    } else {
      startDriverRealGps(currentBus.id);
    }
  };

  const handleQuickIssue = (type: string) => {
    if (!currentBus) return;
    reportIssue(currentBus.id, type);
    setShowIssueModal(false);
  };

  if (!currentBus) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl shadow-sm">
          🚌
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Assigned Shuttles in Fleet</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          All buses have been removed from the fleet system. To use the Driver Console and broadcast live GPS, restore the campus fleet or add a bus via Fleet Admin.
        </p>
        <button
          onClick={resetDefaultFleet}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-md transition-all"
        >
          Restore Campus Fleet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner: Driver HUD safety warning */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            🚌
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              <span>Driver Cockpit HUD: {currentBus.busNumber}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                {currentBus.registrationNumber}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Driver: {user?.name || 'Authorized Fleet Driver'} · Vehicle: {currentBus.model}
            </div>
          </div>
        </div>

        {/* Bus Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Switch Bus:</span>
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
          >
            {buses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.busNumber} ({b.registrationNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Trip Control Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Active Shift Management</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Route: <span className="font-semibold text-slate-700 dark:text-slate-200">{currentRoute.routeName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider ${
                isTripActive
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isTripActive ? '● TRIP IN PROGRESS' : 'IDLE AT DEPOT'}
            </span>
          </div>
        </div>

        {/* Large Distraction-Free Trip Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!isTripActive ? (
            <button
              onClick={() => startTrip(currentBus.id)}
              className="py-5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>START SCHEDULED TRIP</span>
            </button>
          ) : (
            <button
              onClick={() => endTrip(currentBus.id)}
              className="py-5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              <span>END TRIP & PARK SHUTTLE</span>
            </button>
          )}

          {/* Real Device GPS Broadcast Button */}
          <button
            onClick={handleToggleGps}
            className={`py-5 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-md ${
              driverGpsActive
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 ring-4 ring-blue-500/20'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
            }`}
          >
            <svg className={`w-6 h-6 ${driverGpsActive ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            <span>
              {driverGpsActive ? '● STOP REAL GPS BROADCAST' : '📡 SHARE DEVICE LIVE GPS'}
            </span>
          </button>
        </div>

        {/* GPS Permission / Connection Status Alert */}
        {driverGpsStatus === 'denied' && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            <strong>Location Permission Denied:</strong> {driverGpsError}
          </div>
        )}

        {driverGpsStatus === 'unavailable' && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
            <strong>GPS Unavailable:</strong> {driverGpsError}
          </div>
        )}

        {/* Real-time Telemetry Readout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">
          <div>
            <div className="text-slate-400 font-medium">Latitude</div>
            <div className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {currentLocation ? currentLocation.latitude.toFixed(5) : '—'}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Longitude</div>
            <div className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {currentLocation ? currentLocation.longitude.toFixed(5) : '—'}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Speed</div>
            <div className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5 tabular-nums">
              {currentLocation ? `${currentLocation.speedKmH} km/h` : '0 km/h'}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">GPS Accuracy</div>
            <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
              {currentLocation?.accuracyMeters ? `±${currentLocation.accuracyMeters}m` : 'Good'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Controls: Next Stop & Report Delay */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Next Stop Progression */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Route Stop Checklist</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Advance when arriving at or departing a campus pickup stop.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
            <div className="text-slate-400">Current Designated Stop:</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {currentRoute.stops[currentLocation?.currentStopIndex ?? 0]?.name || 'Info Institute of Engineering Campus'}
            </div>
          </div>

          <button
            onClick={() => advanceNextStop(currentBus.id)}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>CONFIRM ARRIVAL AT NEXT STOP →</span>
          </button>
        </div>

        {/* Quick Incident & Delay Reporting */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">One-Tap Delay Advisory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instantly notifies waiting students and fleet administrators.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickIssue('Heavy Traffic Congestion (+10 min)')}
              className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-xs font-bold text-left transition-colors"
            >
              🚦 Heavy Traffic
            </button>
            <button
              onClick={() => handleQuickIssue('Road Detour / Construction (+15 min)')}
              className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-xs font-bold text-left transition-colors"
            >
              🚧 Route Detour
            </button>
            <button
              onClick={() => handleQuickIssue('Heavy Rain / Waterlogging (+10 min)')}
              className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-xs font-bold text-left transition-colors"
            >
              🌧️ Rain / Waterlogging
            </button>
            <button
              onClick={() => handleQuickIssue('Mechanical Pre-Check (+5 min)')}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold text-left transition-colors"
            >
              🔧 Tech Safety Check
            </button>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Trigger Campus Emergency SOS for this vehicle?')) {
                reportIssue(currentBus.id, 'EMERGENCY SOS: Immediate Assistance Requested');
                alert('Campus SOS broadcasted to Transport Control and Security.');
              }
            }}
            className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-800 transition-colors"
          >
            🚨 Emergency Fleet SOS
          </button>
        </div>
      </div>
    </div>
  );
};
