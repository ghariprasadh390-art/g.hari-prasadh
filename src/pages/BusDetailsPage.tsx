import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const BusDetailsPage: React.FC = () => {
  const { buses, routes, drivers, busLocations, setActiveBusId } = useApp();
  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const routeBuses = buses.filter((b) => b.routeId === selectedRoute.id);

  const filteredRoutes = routes.filter(
    (r) =>
      r.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.routeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.stops.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Campus Shuttle Corridors & Schedules
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              TIMETABLE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full directory of stops, scheduled morning arrivals, vehicle specifications, and driver details.
          </p>
        </div>

        {/* Search Route or Stop */}
        <div className="w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stop or corridor..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Route Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRoutes.map((route) => {
          const isSelected = route.id === selectedRoute.id;
          return (
            <div
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-600 text-white font-mono">
                  {route.routeNumber}
                </span>
                <span className="text-xs text-slate-400 font-mono">{route.totalDistanceKm} km</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{route.routeName}</h3>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {route.stops.length} Stops · ~{route.estimatedDurationMin} mins trip
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Route Detailed Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stops Sequence Checklist */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedRoute.routeNumber}: {selectedRoute.routeName}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                From <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedRoute.startLocation}</span> to{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedRoute.endLocation}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {selectedRoute.stops.map((stop, idx) => (
              <div
                key={stop.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{stop.name}</div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5">{stop.landmark}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      GPS: {stop.coordinates[0].toFixed(4)}° N, {stop.coordinates[1].toFixed(4)}° E
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                    {stop.scheduledTime}
                  </div>
                  <div className="text-[10px] text-slate-400">Scheduled Morning Arrival</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Shuttles & Driver Specs for this Route */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Shuttles on this Route</h3>

            {routeBuses.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No buses assigned to this route.</div>
            ) : (
              routeBuses.map((bus) => {
                const driver = drivers.find((d) => d.id === bus.driverId);
                const loc = busLocations[bus.id];

                return (
                  <div
                    key={bus.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{bus.busNumber}</div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          bus.status === 'moving'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {bus.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                      <div>
                        <span className="text-slate-400">Reg:</span>{' '}
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {bus.registrationNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Driver:</span> {driver?.name || 'Unassigned'}
                      </div>
                      <div>
                        <span className="text-slate-400">Capacity:</span> {bus.capacity} seats ({bus.currentOccupancy} occupied)
                      </div>
                      <div>
                        <span className="text-slate-400">Model:</span> {bus.model}
                      </div>
                      {loc && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                          Speed: {loc.speedKmH} km/h · {loc.isLiveGps ? '● Live Device GPS' : '⚡ Demo Telemetry'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
