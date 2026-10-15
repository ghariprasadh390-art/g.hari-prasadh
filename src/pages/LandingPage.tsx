import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode?: 'signin' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { buses, routes, setActiveBusId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const activeBusesCount = buses.filter((b) => b.status === 'moving' || b.status === 'delayed').length;

  const filteredBuses = buses.filter(
    (b) =>
      b.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200 dark:border-slate-800 bg-linear-to-b from-blue-50/60 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>INFO INSTITUTE OF ENGINEERING SMART TRANSPORTATION PORTAL</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Real-Time College Bus Tracking for Students & Fleet Operations
              </h1>

              <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Track campus shuttles in real time along the Sathyamangalam – Info Institute of Engineering corridor, Gandhipuram, Tirupur, and Mettupalayam with live GPS telemetry, stop ETAs, and traffic delay alerts.
              </p>

              {/* Quick Search Bus Bar */}
              <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2 max-w-lg">
                <div className="flex items-center gap-2 px-3 py-2 w-full text-slate-400">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Bus # (e.g. Bus 14, Bus 08)..."
                    className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={() => onNavigate('student')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all whitespace-nowrap shrink-0"
                >
                  Track Bus
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('student')}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-2"
                >
                  <span>🎓 Student Portal</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => onNavigate('driver')}
                  className="px-5 py-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-2"
                >
                  <span>🚌 Driver HUD Console</span>
                </button>

                <button
                  onClick={() => onNavigate('admin')}
                  className="px-5 py-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-xs rounded-xl transition-all"
                >
                  ⚙️ Admin Fleet Hub
                </button>
              </div>

              {/* Live Campus Fleet Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                    {activeBusesCount} / {buses.length}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">Buses En Route</div>
                </div>
                <div>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    98.4%
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">On-Time Reliability</div>
                </div>
                <div>
                  <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                    {routes.length} Routes
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">Campus Corridors</div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Fidelity Bus Graphic & Route Preview */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 p-6 shadow-2xl border border-slate-800 text-white">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Live Telemetry Stream
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">GPS ACCURACY ±3m</span>
                </div>

                {/* SVG Fleet Graphic */}
                <div className="my-6 p-4 rounded-2xl bg-linear-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Featured Shuttle: Bus 01 (Sathy Special)
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                      IN TRANSIT · NH 948
                    </span>
                  </div>

                  <div className="h-28 rounded-xl bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800">
                    {/* Road markings */}
                    <div className="absolute inset-x-0 h-0.5 border-b border-dashed border-slate-700 top-1/2" />
                    <div className="z-10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/50">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h8m-9 9h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zm1-2a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-white">Sathyamangalam – Info Institute</div>
                        <div className="text-xs text-slate-400">Next: Annur Bus Stand (NH 948)</div>
                        <div className="text-[11px] text-blue-400 font-mono mt-0.5">ETA: 8 mins · 48 km/h</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Fleet Quick Links */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Active Morning Shuttles
                  </div>
                  {buses.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      onClick={() => {
                        setActiveBusId(b.id);
                        onNavigate('student');
                      }}
                      className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-between border border-slate-700/50"
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{b.busNumber}</span>
                          <span className="text-[10px] text-slate-400">({b.registrationNumber})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Occupancy: {b.currentOccupancy}/{b.capacity} seats
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            b.status === 'moving'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : b.status === 'delayed'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {b.status.toUpperCase()}
                        </span>
                        <div className="text-[10px] text-blue-400 hover:underline mt-1 font-semibold">
                          View Live Map →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              Seamless Daily Commute
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              How Campus Transit Works for Students
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Sign In with Google</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Connect your student Google account. Enter your Roll Number and select your neighborhood pickup stop.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Track Live Bus on Map</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Watch the bus move in real time on the OpenStreetMap interface with live speed, direction, and ETA countdown.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Never Miss Your Ride</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Receive proactive alerts when your shuttle is 2 stops away, and get instant notifications if traffic causes delays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              Engineered for Campus Safety
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Enterprise Transit Features
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Real Device Geolocation</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Authorized drivers broadcast real-time GPS coordinates directly via device Geolocation API without bulky hardware.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Dynamic Stop ETAs</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Calculates arrival countdowns dynamically based on road distances, vehicle speeds, and congestion reports.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Distraction-Free Driver HUD</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                High-contrast, large touch targets ensure drivers safely share location and report traffic with a single tap.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Admin Fleet Control</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Full lifecycle management for buses, drivers, routes, stop coordinates, student assignments, and broadcast notices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* College Transportation Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="text-white font-bold text-sm">Info Institute of Engineering CampusTransit</div>
              <p className="leading-relaxed">
                Official smart bus tracking and fleet telemetry system for Info Institute of Engineering students, faculty, and drivers along the Sathy Highway corridor.
              </p>
            </div>

            <div>
              <div className="text-white font-bold text-xs mb-3">Quick Navigation</div>
              <ul className="space-y-2">
                <li><button onClick={() => onNavigate('student')} className="hover:text-white">Student Live Map</button></li>
                <li><button onClick={() => onNavigate('routes')} className="hover:text-white">Routes & Time Schedule</button></li>
                <li><button onClick={() => onNavigate('driver')} className="hover:text-white">Driver Console</button></li>
                <li><button onClick={() => onNavigate('admin')} className="hover:text-white">Fleet Administration</button></li>
              </ul>
            </div>

            <div>
              <div className="text-white font-bold text-xs mb-3">Transit Office</div>
              <ul className="space-y-2">
                <li>Transport Directorate, Ground Floor, Admin Block</li>
                <li>NH 209, Sathy Road, Kovilpalayam, Coimbatore - 641107</li>
                <li>Helpline: +91 422 236 3700</li>
                <li>Emergency SOS: +91 94432 18901</li>
                <li>Email: transport@infoengg.edu.in</li>
              </ul>
            </div>

            <div>
              <div className="text-white font-bold text-xs mb-3">Operating Hours</div>
              <p className="leading-relaxed">
                Morning Sathy Route: 07:05 AM – 08:28 AM<br />
                City Feeder Routes: 07:25 AM – 08:25 AM<br />
                Evening Return Shuttles: 04:45 PM – 06:45 PM
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>&copy; 2026 Info Institute of Engineering. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Apex Campus Privacy Policy: GPS data is only recorded during authorized transit hours.'); }} className="hover:text-white">Privacy Policy</a>
              <span>·</span>
              <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service: Student transport pass valid for current semester.'); }} className="hover:text-white">Terms of Transit</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
