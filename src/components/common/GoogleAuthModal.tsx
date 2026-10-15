import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'register';
  onSuccess?: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
}) => {
  const { loginWithGoogle, completeStudentProfile, routes, buses } = useApp();

  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [step, setStep] = useState<'auth' | 'onboarding' | 'success'>('auth');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Email / Password form fields
  const [emailInput, setEmailInput] = useState('g.hariprasadh390@gmail.com');
  const [passwordInput, setPasswordInput] = useState('••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Onboarding profile state
  const [studentId, setStudentId] = useState('2024CS' + Math.floor(1000 + Math.random() * 9000));
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [phoneNumber, setPhoneNumber] = useState('+91 98400 12345');
  const [collegeName, setCollegeName] = useState('Info Institute of Engineering');
  const [assignedBus, setAssignedBus] = useState('bus-01');
  const [assignedStop, setAssignedStop] = useState('stop-sathy-5');

  if (!isOpen) return null;

  // Handle Google OAuth trigger
  const handleGoogleClick = () => {
    setIsAuthenticating(true);
    setAuthError(null);

    // Simulate genuine Google OAuth prompt settling
    setTimeout(() => {
      setIsAuthenticating(false);
      try {
        const { needsOnboarding } = loginWithGoogle(emailInput, 'G. Hariprasadh', selectedRole);

        if (mode === 'register' || needsOnboarding) {
          setStep('onboarding');
        } else {
          setStep('success');
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 900);
        }
      } catch (err: any) {
        setAuthError(err.message || 'Authentication failed. Please retry.');
      }
    }, 700);
  };

  // Handle traditional email submit
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      const name = emailInput.split('@')[0].replace('.', ' ').toUpperCase();
      const { needsOnboarding } = loginWithGoogle(emailInput, name, selectedRole);

      if (mode === 'register' || needsOnboarding) {
        setStep('onboarding');
      } else {
        setStep('success');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 900);
      }
    }, 600);
  };

  // Complete Onboarding Details
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    completeStudentProfile({
      studentId,
      department,
      yearOfStudy,
      phone: phoneNumber,
      collegeName,
      assignedBusId: assignedBus,
      assignedStopId: assignedStop,
    });
    setStep('success');
    setTimeout(() => {
      onClose();
      if (onSuccess) onSuccess();
    }, 1100);
  };

  const selectedRoute = routes.find((r) => {
    const b = buses.find((item) => item.id === assignedBus);
    return b ? r.id === b.routeId : false;
  }) || routes[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h8m-9 9h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2zm1-2a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">CampusTransit Portal</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Info Institute of Engineering</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {step === 'auth' && (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {mode === 'signin' ? 'Sign in to Your Account' : 'Create Student Account'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Access real-time bus locations, live ETAs, and campus route alerts.
                </p>
              </div>

              {/* Role Picker (Student, Driver, Admin) */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Select Portal Role</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {(['student', 'driver', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`py-2 text-xs font-semibold capitalize rounded-lg transition-all ${
                        selectedRole === r
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Official Google Button */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isAuthenticating}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-xs hover:shadow-md disabled:opacity-60"
              >
                {/* Official Multicolor Google G Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {isAuthenticating
                    ? 'Connecting Google...'
                    : mode === 'signin'
                    ? 'Continue with Google'
                    : 'Register with Google'}
                </span>
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-400 font-medium">or continue with email</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    College / Personal Email
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="student@apex.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your email.'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Forgot?
                    </a>
                  </div>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-60"
                >
                  {isAuthenticating
                    ? 'Processing...'
                    : mode === 'signin'
                    ? 'Sign In to Portal'
                    : 'Create Account'}
                </button>
              </form>

              {/* Mode Switcher */}
              <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
                {mode === 'signin' ? (
                  <span>
                    New student at Apex?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Register with Google ID
                    </button>
                  </span>
                ) : (
                  <span>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Sign In here
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Student Onboarding Step */}
          {step === 'onboarding' && (
            <div>
              <div className="mb-5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-bold">Google account connected successfully!</span> Complete your college profile to start tracking your bus.
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Student ID / Roll No
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="2024CS1084"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Year of Study
                    </label>
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                      <option>Postgraduate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98400 12345"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Assigned Bus
                    </label>
                    <select
                      value={assignedBus}
                      onChange={(e) => setAssignedBus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      {buses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.busNumber} ({b.registrationNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Boarding Stop
                    </label>
                    <select
                      value={assignedStop}
                      onChange={(e) => setAssignedStop(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      {selectedRoute.stops.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20"
                >
                  Complete Registration & Open Dashboard
                </button>
              </form>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Authenticated Successfully</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Redirecting to your dashboard...</p>
            </div>
          )}

          {/* Quick Demo Switcher Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide text-center mb-2">
              Instant 1-Click Demo Profiles
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  loginWithGoogle('g.hariprasadh390@gmail.com', 'G. Hariprasadh (Student)', 'student');
                  onClose();
                  if (onSuccess) onSuccess();
                }}
                className="px-2 py-1.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-center"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => {
                  loginWithGoogle('murugesan.m@infoengg.edu.in', 'M. Murugesan (Sathy Driver)', 'driver');
                  onClose();
                  if (onSuccess) onSuccess();
                }}
                className="px-2 py-1.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-center"
              >
                🚌 Driver
              </button>
              <button
                type="button"
                onClick={() => {
                  loginWithGoogle('transport.director@infoengg.edu.in', 'Fleet Admin (IIE)', 'admin');
                  onClose();
                  if (onSuccess) onSuccess();
                }}
                className="px-2 py-1.5 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-center"
              >
                ⚙️ Fleet Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
