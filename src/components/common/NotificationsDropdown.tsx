import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const NotificationsDropdown: React.FC = () => {
  const { notifications, markNotificationRead, clearAllNotifications } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-40 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Campus Transit Alerts</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
                </p>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active transit alerts. All routes operating on schedule.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                      !n.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {n.type === 'approaching' && (
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            Approaching
                          </span>
                        )}
                        {n.type === 'delay' && (
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                            Traffic Delay
                          </span>
                        )}
                        {n.type === 'info' && (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Notice
                          </span>
                        )}
                        {n.type === 'system' && (
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            GPS Telemetry
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{n.createdAt}</span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{n.title}</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
