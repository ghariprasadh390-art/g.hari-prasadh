import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationsDropdown } from './NotificationsDropdown';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenAuth: (mode?: 'signin' | 'register') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, activeTab, setActiveTab }) => {
  const { user, logout, switchRole, isDarkMode, toggleDarkMode, driverGpsActive } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h8m-9 9h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zm1-2a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/>
              </svg>
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block leading-tight">
                CampusTransit
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase block">
                Info Institute Fleet
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('student')}
            className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'student' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            Live Tracking
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'routes' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            Routes & Stops
          </button>
          <button
            onClick={() => setActiveTab('driver')}
            className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'driver' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            <span>Driver Console</span>
            {driverGpsActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Broadcasting GPS" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'admin' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''
            }`}
          >
            Fleet Admin
          </button>
        </nav>

        {/* Zone 3: Primary Action & Account Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Notifications Dropdown */}
          <NotificationsDropdown />

          {/* User Profile or Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[110px]">{user.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{user.role}</div>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-40 p-2">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{user.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      {user.studentId && (
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                          ID: {user.studentId}
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Active View
                      </div>
                      <button
                        onClick={() => {
                          switchRole('student');
                          setActiveTab('student');
                          setUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                          user.role === 'student' ? 'text-blue-600 font-bold' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>🎓 Student Portal</span>
                      </button>
                      <button
                        onClick={() => {
                          switchRole('driver');
                          setActiveTab('driver');
                          setUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                          user.role === 'driver' ? 'text-blue-600 font-bold' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>🚌 Driver Console</span>
                      </button>
                      <button
                        onClick={() => {
                          switchRole('admin');
                          setActiveTab('admin');
                          setUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                          user.role === 'admin' ? 'text-blue-600 font-bold' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>⚙️ Fleet Admin</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('signin')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shadow-blue-500/20 whitespace-nowrap shrink-0"
            >
              Portal Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
