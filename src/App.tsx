import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { GoogleAuthModal } from './components/common/GoogleAuthModal';
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { BusDetailsPage } from './pages/BusDetailsPage';

const AppContent: React.FC = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<string>('student');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register'>('signin');

  const handleOpenAuth = (mode: 'signin' | 'register' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    // Navigate to appropriate role page
    if (user?.role === 'driver') {
      setActiveTab('driver');
    } else if (user?.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('student');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage onNavigate={setActiveTab} onOpenAuth={handleOpenAuth} />
        )}

        {activeTab === 'student' && (
          <StudentDashboard onOpenAuth={handleOpenAuth} />
        )}

        {activeTab === 'driver' && <DriverDashboard />}

        {activeTab === 'admin' && <AdminDashboard />}

        {activeTab === 'routes' && <BusDetailsPage />}
      </main>

      {/* Google Authentication & Student Onboarding Modal */}
      <GoogleAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
