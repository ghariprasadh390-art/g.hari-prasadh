import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LeafletBusMap } from '../components/common/LeafletBusMap';
import { Bus, Driver, Route } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    buses,
    drivers,
    routes,
    students,
    busLocations,
    trips,
    addBus,
    updateBus,
    deleteBus,
    removeAllBuses,
    resetDefaultFleet,
    addDriver,
    updateDriver,
    deleteDriver,
    addRoute,
    assignStudent,
    broadcastNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'buses' | 'drivers' | 'routes' | 'students' | 'broadcast' | 'trips'>('overview');

  // Modals state
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);

  // New Bus Form
  const [newBusNumber, setNewBusNumber] = useState('');
  const [newRegNumber, setNewRegNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('48');
  const [newRouteId, setNewRouteId] = useState(routes[0]?.id || '');
  const [newDriverId, setNewDriverId] = useState(drivers[0]?.id || '');
  const [newModel, setNewModel] = useState('Tata Starbus Ultra');

  // New Driver Form
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('+91 ');
  const [newLicense, setNewLicense] = useState('KA-');
  const [newExp, setNewExp] = useState('5');
  const [newAssignedBus, setNewAssignedBus] = useState(buses[0]?.id || '');

  // Announcement Form
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [targetBusFilter, setTargetBusFilter] = useState('all');
  const [announcementPriority, setAnnouncementPriority] = useState<'low' | 'medium' | 'high'>('high');

  // Student Assignment State
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignBusId, setAssignBusId] = useState(buses[0]?.id || '');
  const [assignStopId, setAssignStopId] = useState(routes[0]?.stops[0]?.id || '');

  // Metrics
  const activeBusesCount = buses.filter((b) => b.status === 'moving' || b.status === 'delayed').length;
  const delayedBusesCount = buses.filter((b) => b.status === 'delayed').length;

  // Handle Add Bus
  const handleCreateBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusNumber || !newRegNumber) return;
    addBus({
      busNumber: newBusNumber,
      registrationNumber: newRegNumber,
      capacity: Number(newCapacity) || 48,
      currentOccupancy: 0,
      driverId: newDriverId,
      routeId: newRouteId,
      status: 'offline',
      model: newModel,
      fuelType: 'CNG Eco-Transit',
    });
    setNewBusNumber('');
    setNewRegNumber('');
    setShowAddBusModal(false);
  };

  // Handle Add Driver
  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName || !newDriverPhone) return;
    addDriver({
      name: newDriverName,
      phone: newDriverPhone,
      licenseNumber: newLicense,
      assignedBusId: newAssignedBus,
      experienceYears: Number(newExp) || 3,
      rating: 5.0,
      avatarUrl: '',
      status: 'on_duty',
    });
    setNewDriverName('');
    setNewDriverPhone('+91 ');
    setShowAddDriverModal(false);
  };

  // Handle Broadcast Notification
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementMsg) return;
    broadcastNotification(
      announcementTitle,
      announcementMsg,
      targetBusFilter === 'all' ? undefined : targetBusFilter,
      announcementPriority
    );
    alert('Announcement successfully broadcasted to student portals.');
    setAnnouncementTitle('');
    setAnnouncementMsg('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Campus Fleet Command Center</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              ADMIN CONTROL
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time fleet monitoring, route coordination, driver allocations, and campus alerts.
          </p>
        </div>

        {/* Quick Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
          {[
            { id: 'overview', label: 'Fleet Map' },
            { id: 'buses', label: 'Buses' },
            { id: 'drivers', label: 'Drivers' },
            { id: 'routes', label: 'Routes' },
            { id: 'students', label: 'Students' },
            { id: 'broadcast', label: 'Announcements' },
            { id: 'trips', label: 'Daily Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Fleet Buses</div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {buses.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {activeBusesCount} currently on route
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Active Drivers</div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {drivers.filter((d) => d.status === 'on_duty').length}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            {drivers.length} registered total
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Enrolled Students</div>
          <div className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
            {students.length}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Assigned to morning routes
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">On-Time Performance</div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {delayedBusesCount === 0 ? '100%' : `${Math.round(((buses.length - delayedBusesCount) / buses.length) * 100)}%`}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
            {delayedBusesCount} delayed in traffic
          </div>
        </div>
      </div>

      {/* Tab 1: Master Fleet Map */}
      {activeTab === 'overview' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Live Master Fleet Tracking (All Vehicles)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time spatial visualization of all campus transit shuttles and active corridors.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {buses.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {activeBusesCount} vehicles moving ({buses.length} registered)
                  </span>
                </div>
              ) : (
                <span className="text-rose-500 font-semibold">0 buses in fleet</span>
              )}

              {buses.length === 0 && (
                <button
                  onClick={resetDefaultFleet}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Restore Default Fleet
                </button>
              )}
            </div>
          </div>

          {buses.length === 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span>Fleet is currently empty. All buses were removed. Click &quot;Restore Default Fleet&quot; to restore pre-configured college buses or add new ones.</span>
              </div>
              <button
                onClick={resetDefaultFleet}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shrink-0"
              >
                Restore Fleet
              </button>
            </div>
          )}

          <LeafletBusMap
            allBuses={buses}
            allLocations={busLocations}
            showAllBuses={true}
            heightClass="h-[520px]"
          />
        </div>
      )}

      {/* Tab 2: Bus Management */}
      {activeTab === 'buses' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Bus Fleet Management</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add, reassign, or decommission shuttles in the college fleet ({buses.length} total buses).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Reset fleet to default pre-configured college buses (Sathyamangalam, Gandhipuram, Tirupur, Mettupalayam)?')) {
                    resetDefaultFleet();
                  }
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors"
                title="Restore default campus buses"
              >
                Reset Default Fleet
              </button>
              {buses.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to REMOVE ALL BUSES from the fleet? This will clear all buses from tracking.')) {
                      removeAllBuses();
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-semibold text-xs rounded-xl transition-colors"
                  title="Remove all buses from fleet"
                >
                  Remove All Buses
                </button>
              )}
              <button
                onClick={() => setShowAddBusModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>+ Add New Bus</span>
              </button>
            </div>
          </div>

          {buses.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl shadow-sm">
                🚌
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No Buses in Fleet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  All buses have been removed. You can register a new bus with custom route and driver details, or restore the pre-configured Info Institute of Engineering fleet anytime.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={resetDefaultFleet}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                >
                  Restore Default Fleet (5 Buses)
                </button>
                <button
                  onClick={() => setShowAddBusModal(true)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold text-xs rounded-xl transition-all"
                >
                  + Add New Bus
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Bus #</th>
                    <th className="pb-3">Registration</th>
                    <th className="pb-3">Model</th>
                    <th className="pb-3">Assigned Route</th>
                    <th className="pb-3">Assigned Driver</th>
                    <th className="pb-3">Capacity</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {buses.map((bus) => {
                    const r = routes.find((route) => route.id === bus.routeId);
                    const d = drivers.find((driver) => driver.id === bus.driverId);
                    return (
                      <tr key={bus.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 font-bold text-slate-900 dark:text-white">{bus.busNumber}</td>
                        <td className="py-3.5 font-mono text-slate-600 dark:text-slate-300">{bus.registrationNumber}</td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-400">{bus.model}</td>
                        <td className="py-3.5 text-slate-800 dark:text-slate-200 font-medium">{r?.routeName || 'Unassigned'}</td>
                        <td className="py-3.5 text-slate-800 dark:text-slate-200">{d?.name || 'Unassigned'}</td>
                        <td className="py-3.5 font-mono tabular-nums">{bus.capacity} seats</td>
                        <td className="py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              bus.status === 'moving'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                                : bus.status === 'delayed'
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                            }`}
                          >
                            {bus.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              const newStatus = bus.status === 'moving' ? 'stopped' : 'moving';
                              updateBus(bus.id, { status: newStatus });
                            }}
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            Toggle Status
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${bus.busNumber}?`)) {
                                deleteBus(bus.id);
                              }
                            }}
                            className="text-rose-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Driver Directory */}
      {activeTab === 'drivers' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Driver Roster & Allocations</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage contact information, commercial license details, and shift states.
              </p>
            </div>
            <button
              onClick={() => setShowAddDriverModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>+ Add Driver</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((d) => {
              const assignedBus = buses.find((b) => b.id === d.assignedBusId);
              return (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                        {d.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{d.name}</div>
                        <div className="text-[10px] text-slate-400">{d.experienceYears} Years Experience</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      ★ {d.rating}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="text-slate-400">Phone:</span> {d.phone}
                    </div>
                    <div>
                      <span className="text-slate-400">License:</span>{' '}
                      <span className="font-mono">{d.licenseNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Assigned:</span>{' '}
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {assignedBus ? `${assignedBus.busNumber} (${assignedBus.registrationNumber})` : 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        const newPhone = prompt('Update phone number:', d.phone);
                        if (newPhone) updateDriver(d.id, { phone: newPhone });
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove driver ${d.name}?`)) deleteDriver(d.id);
                      }}
                      className="text-rose-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Routes & Stops */}
      {activeTab === 'routes' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Campus Routes & Waypoints</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View designated arterial paths and scheduled stop times.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {routes.map((route) => (
              <div
                key={route.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {route.routeNumber}: {route.routeName}
                    </span>
                  </div>
                  <div className="text-slate-500 font-mono">
                    {route.totalDistanceKm} km · Est. {route.estimatedDurationMin} mins
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                  {route.stops.map((stop, sIdx) => (
                    <div
                      key={stop.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {sIdx + 1}. {stop.name}
                        </span>
                        <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                          {stop.scheduledTime}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 truncate">{stop.landmark}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Registered Students */}
      {activeTab === 'students' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Student Enrollment & Pass Roster</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View registered students and allocate assigned shuttles.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Roll No</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Year</th>
                  <th className="pb-3">Assigned Bus</th>
                  <th className="pb-3">Boarding Stop</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {students.map((st) => {
                  const b = buses.find((bus) => bus.id === st.assignedBusId);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{st.name}</td>
                      <td className="py-3 font-mono text-slate-600 dark:text-slate-300">{st.studentId || 'N/A'}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{st.department || 'General'}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{st.yearOfStudy || 'Undergrad'}</td>
                      <td className="py-3 font-bold text-blue-600 dark:text-blue-400">{b?.busNumber || 'None'}</td>
                      <td className="py-3 text-slate-700 dark:text-slate-300">Stop 3</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            const newBus = prompt('Assign new Bus ID (e.g. bus-08, bus-12, bus-14):', st.assignedBusId || 'bus-14');
                            if (newBus) assignStudent(st.id, newBus, 'stop-14-1');
                          }}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          Reassign
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Announcements Broadcast */}
      {activeTab === 'broadcast' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Broadcast Announcement to Students</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sends an immediate high-priority transit notice to student dashboards and notifications dropdown.
            </p>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Announcement Headline
              </label>
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="e.g. Rain Delay Advisory / Detour Notification"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Message
              </label>
              <textarea
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                rows={3}
                placeholder="Due to road repairs on Main Arterial corridor, Bus 12 is rerouted via Ring Road. Scheduled stop times will be delayed by ~15 mins."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
                <select
                  value={targetBusFilter}
                  onChange={(e) => setTargetBusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  <option value="all">All Enrolled Students (Entire Campus)</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      Only Students on {b.busNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alert Priority</label>
                <select
                  value={announcementPriority}
                  onChange={(e) => setAnnouncementPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  <option value="high">High (Immediate Popup Banner)</option>
                  <option value="medium">Medium (Standard Advisory)</option>
                  <option value="low">Low (Routine Notice)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              Broadcast Notice Immediately
            </button>
          </form>
        </div>
      )}

      {/* Tab 7: Daily Trip Logs */}
      {activeTab === 'trips' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Daily Run Logs & On-Time Records</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit records of morning and evening runs with schedule adherence.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Bus</th>
                  <th className="pb-3">Driver</th>
                  <th className="pb-3">Departure</th>
                  <th className="pb-3">Arrival</th>
                  <th className="pb-3">Delay / Deviation</th>
                  <th className="pb-3">Trip Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {trips.map((t) => {
                  const b = buses.find((bus) => bus.id === t.busId);
                  const d = drivers.find((driver) => driver.id === t.driverId);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-mono text-slate-600 dark:text-slate-400">{t.date}</td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{b?.busNumber || t.busId}</td>
                      <td className="py-3 text-slate-700 dark:text-slate-300">{d?.name || 'Assigned Driver'}</td>
                      <td className="py-3 font-mono">{t.startTime}</td>
                      <td className="py-3 font-mono">{t.endTime || 'En Route'}</td>
                      <td className="py-3">
                        {t.delayMinutes > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            +{t.delayMinutes} min delay
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">On Time</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                          {t.tripStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Bus Modal */}
      {showAddBusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Shuttle to Fleet</h3>
            <form onSubmit={handleCreateBus} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Bus Number (e.g. Bus 19)</label>
                <input
                  type="text"
                  value={newBusNumber}
                  onChange={(e) => setNewBusNumber(e.target.value)}
                  placeholder="Bus 19"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Registration Number</label>
                <input
                  type="text"
                  value={newRegNumber}
                  onChange={(e) => setNewRegNumber(e.target.value)}
                  placeholder="KA-04-J-9921"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Assigned Route</label>
                <select
                  value={newRouteId}
                  onChange={(e) => setNewRouteId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.routeNumber} – {r.routeName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Assigned Driver</label>
                <select
                  value={newDriverId}
                  onChange={(e) => setNewDriverId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBusModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl">
                  Add Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Register Fleet Driver</h3>
            <form onSubmit={handleCreateDriver} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Driver Full Name</label>
                <input
                  type="text"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Commercial License</label>
                  <input
                    type="text"
                    value={newLicense}
                    onChange={(e) => setNewLicense(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Years Experience</label>
                  <input
                    type="number"
                    value={newExp}
                    onChange={(e) => setNewExp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Assigned Vehicle</label>
                <select
                  value={newAssignedBus}
                  onChange={(e) => setNewAssignedBus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} ({b.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDriverModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl">
                  Register Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
