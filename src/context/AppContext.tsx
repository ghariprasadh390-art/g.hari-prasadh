import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  AppNotification,
  Bus,
  BusLocation,
  Driver,
  Route,
  Trip,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_BUS_LOCATIONS,
  INITIAL_BUSES,
  INITIAL_DRIVERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ROUTES,
  INITIAL_STUDENTS,
  INITIAL_TRIPS,
} from '../data/mockData';

interface AppContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loginWithGoogle: (email?: string, name?: string, role?: UserRole) => { needsOnboarding: boolean; user: User };
  completeStudentProfile: (details: Partial<User>) => void;
  switchRole: (role: UserRole) => void;

  buses: Bus[];
  drivers: Driver[];
  routes: Route[];
  students: User[];
  busLocations: Record<string, BusLocation>;
  trips: Trip[];
  notifications: AppNotification[];

  activeBusId: string;
  setActiveBusId: (id: string) => void;
  selectedStopId: string;
  setSelectedStopId: (id: string) => void;

  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Driver GPS actions
  driverGpsActive: boolean;
  driverGpsStatus: 'inactive' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error';
  driverGpsError: string | null;
  startDriverRealGps: (busId: string) => void;
  stopDriverRealGps: () => void;
  startTrip: (busId: string) => void;
  endTrip: (busId: string) => void;
  advanceNextStop: (busId: string) => void;
  reportIssue: (busId: string, issueType: string, note?: string) => void;

  // Admin Fleet Management
  addBus: (bus: Omit<Bus, 'id'>) => void;
  updateBus: (id: string, updates: Partial<Bus>) => void;
  deleteBus: (id: string) => void;
  removeAllBuses: () => void;
  resetDefaultFleet: () => void;
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  updateDriver: (id: string, updates: Partial<Driver>) => void;
  deleteDriver: (id: string) => void;
  addRoute: (route: Omit<Route, 'id'>) => void;
  assignStudent: (studentId: string, busId: string, stopId: string) => void;
  broadcastNotification: (title: string, message: string, targetBusId?: string, priority?: 'low' | 'medium' | 'high') => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Live Tracking Simulation Controls
  isSimulationPlaying: boolean;
  toggleSimulationPlay: () => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Calculate distance between two lat/lng in kilometers using Haversine formula
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Calculate bearing/heading in degrees
export function calculateHeading(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence with localStorage
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('campustransit_iie_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    // Default initial user is student-1 (Info Institute of Engineering)
    return INITIAL_STUDENTS[0];
  });

  const [buses, setBuses] = useState<Bus[]>(() => {
    const saved = localStorage.getItem('campustransit_iie_buses');
    return saved ? JSON.parse(saved) : INITIAL_BUSES;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('campustransit_iie_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [routes, setRoutes] = useState<Route[]>(() => {
    const saved = localStorage.getItem('campustransit_iie_routes');
    return saved ? JSON.parse(saved) : INITIAL_ROUTES;
  });

  const [students, setStudents] = useState<User[]>(() => {
    const saved = localStorage.getItem('campustransit_iie_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [busLocations, setBusLocations] = useState<Record<string, BusLocation>>(() => {
    const saved = localStorage.getItem('campustransit_iie_locations');
    return saved ? JSON.parse(saved) : INITIAL_BUS_LOCATIONS;
  });

  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('campustransit_iie_trips');
    return saved ? JSON.parse(saved) : INITIAL_TRIPS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('campustransit_iie_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activeBusId, setActiveBusId] = useState<string>('bus-01');
  const [selectedStopId, setSelectedStopId] = useState<string>('stop-sathy-5');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('campustransit_dark') === 'true';
  });

  // Driver GPS state
  const [driverGpsActive, setDriverGpsActive] = useState(false);
  const [driverGpsStatus, setDriverGpsStatus] = useState<'inactive' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'error'>('inactive');
  const [driverGpsError, setDriverGpsError] = useState<string | null>(null);
  const geoWatchIdRef = useRef<number | null>(null);

  // Broadcast channel for multi-tab realtime synchronization
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('campustransit_telemetry');
      broadcastRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'BUS_LOCATION_UPDATE') {
          setBusLocations((prev) => ({
            ...prev,
            [payload.busId]: payload,
          }));
        } else if (type === 'NOTIFICATION_BROADCAST') {
          setNotifications((prev) => [payload, ...prev]);
        }
      };

      return () => {
        channel.close();
      };
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('campustransit_iie_user', JSON.stringify(user));
    else localStorage.removeItem('campustransit_iie_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('campustransit_iie_buses', JSON.stringify(buses));
  }, [buses]);

  useEffect(() => {
    localStorage.setItem('campustransit_iie_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('campustransit_iie_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('campustransit_iie_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('campustransit_iie_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('campustransit_dark', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const [isSimulationPlaying, setIsSimulationPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const toggleSimulationPlay = () => setIsSimulationPlaying((prev) => !prev);

  const simulationProgressRef = useRef<Record<string, number>>({
    'bus-01': 0.45,
    'bus-02': 0.50,
    'bus-03': 0.35,
    'bus-04': 0.30,
    'bus-05': 0,
  });

  useEffect(() => {
    if (!isSimulationPlaying || buses.length === 0) return;

    const intervalTime = Math.max(600, Math.floor(2200 / simulationSpeed));
    const stepIncrement = 0.015 * simulationSpeed;

    const interval = setInterval(() => {
      setBusLocations((prevLocations) => {
        const updated = { ...prevLocations };
        let hasChanges = false;

        buses.forEach((bus) => {
          // If this bus is being driven by the real device GPS, skip simulation
          if (bus.id === activeBusId && driverGpsActive) return;
          if (bus.status === 'offline' || bus.status === 'stopped') return;

          const route = routes.find((r) => r.id === bus.routeId);
          if (!route || route.pathCoordinates.length < 2) return;

          const currentProg = simulationProgressRef.current[bus.id] ?? 0.1;
          const nextProg = (currentProg + stepIncrement) % 1.0;
          simulationProgressRef.current[bus.id] = nextProg;

          // Interpolate coordinate along pathCoordinates
          const totalPoints = route.pathCoordinates.length;
          const floatIndex = nextProg * (totalPoints - 1);
          const i1 = Math.floor(floatIndex);
          const i2 = Math.min(i1 + 1, totalPoints - 1);
          const fraction = floatIndex - i1;

          const [lat1, lng1] = route.pathCoordinates[i1];
          const [lat2, lng2] = route.pathCoordinates[i2];

          const newLat = Number((lat1 + (lat2 - lat1) * fraction).toFixed(5));
          const newLng = Number((lng1 + (lng2 - lng1) * fraction).toFixed(5));
          const heading = calculateHeading(lat1, lng1, lat2, lng2);

          // Find current and next stop
          let nextStop = route.stops[0];
          let currentStopIndex = 0;
          for (let s = 0; s < route.stops.length; s++) {
            const stop = route.stops[s];
            const dist = calculateDistanceKm(newLat, newLng, stop.coordinates[0], stop.coordinates[1]);
            if (dist < 0.6) {
              currentStopIndex = s;
              nextStop = route.stops[Math.min(s + 1, route.stops.length - 1)];
              break;
            }
          }

          const existingLoc = prevLocations[bus.id];
          const speed = bus.status === 'delayed' ? 14 : 36 + Math.floor(Math.sin(nextProg * 20) * 8);

          updated[bus.id] = {
            ...existingLoc,
            busId: bus.id,
            latitude: newLat,
            longitude: newLng,
            headingDeg: heading,
            speedKmH: Math.max(0, speed),
            timestamp: Date.now(),
            isLiveGps: false, // Explicitly tagged DEMO DATA
            accuracyMeters: 4.5,
            tripStatus: 'in_progress',
            currentStopIndex,
            nextStopId: nextStop ? nextStop.id : '',
            statusMessage:
              bus.status === 'delayed'
                ? 'Experiencing minor delay due to intersection traffic'
                : `En route to ${nextStop?.name || 'Campus'}`,
          };

          hasChanges = true;
        });

        return hasChanges ? updated : prevLocations;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [buses, routes, activeBusId, driverGpsActive, isSimulationPlaying, simulationSpeed]);

  // Real Driver GPS watch using navigator.geolocation
  const startDriverRealGps = useCallback((busId: string) => {
    if (!('geolocation' in navigator)) {
      setDriverGpsStatus('unavailable');
      setDriverGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setDriverGpsStatus('requesting');
    setDriverGpsError(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading, accuracy } = position.coords;
        const speedKmH = speed ? Math.round(speed * 3.6) : 32;

        const liveLocation: BusLocation = {
          busId,
          latitude: Number(latitude.toFixed(5)),
          longitude: Number(longitude.toFixed(5)),
          speedKmH,
          headingDeg: heading ? Math.round(heading) : 0,
          timestamp: position.timestamp,
          isLiveGps: true, // REAL GPS
          accuracyMeters: Math.round(accuracy),
          tripStatus: 'in_progress',
          currentStopIndex: 0,
          nextStopId: '',
          statusMessage: 'Transmitting live GPS telemetry from driver device',
        };

        setBusLocations((prev) => ({
          ...prev,
          [busId]: liveLocation,
        }));

        setDriverGpsActive(true);
        setDriverGpsStatus('granted');

        // Broadcast to other tabs/windows
        if (broadcastRef.current) {
          broadcastRef.current.postMessage({
            type: 'BUS_LOCATION_UPDATE',
            payload: liveLocation,
          });
        }
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setDriverGpsStatus('denied');
          setDriverGpsError('Location permission denied. Please allow location access in your browser settings.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setDriverGpsStatus('unavailable');
          setDriverGpsError('GPS signal temporarily unavailable. Please move to an open area.');
        } else {
          setDriverGpsStatus('error');
          setDriverGpsError(error.message);
        }
        setDriverGpsActive(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );

    geoWatchIdRef.current = watchId;
  }, []);

  const stopDriverRealGps = useCallback(() => {
    if (geoWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }
    setDriverGpsActive(false);
    setDriverGpsStatus('inactive');
    setDriverGpsError(null);
  }, []);

  // Trip operations
  const startTrip = (busId: string) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, status: 'moving' as const } : b))
    );
    const bus = buses.find((b) => b.id === busId);
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      busId,
      driverId: bus?.driverId || 'driver-1',
      routeId: bus?.routeId || 'route-14',
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tripStatus: 'in_progress',
      completedStops: [],
      delayMinutes: 0,
      date: new Date().toISOString().split('T')[0],
      notes: 'Trip initiated by driver.',
    };
    setTrips((prev) => [newTrip, ...prev]);

    // Send broadcast notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `${bus?.busNumber || 'Bus'} Trip Commenced`,
      message: `${bus?.busNumber || 'Bus'} has officially departed its terminal on scheduled morning route.`,
      type: 'info',
      targetBusId: busId,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      priority: 'medium',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const endTrip = (busId: string) => {
    stopDriverRealGps();
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, status: 'stopped' as const } : b))
    );
    setTrips((prev) =>
      prev.map((t) =>
        t.busId === busId && t.tripStatus === 'in_progress'
          ? {
              ...t,
              tripStatus: 'completed' as const,
              endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : t
      )
    );
    const bus = buses.find((b) => b.id === busId);
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `${bus?.busNumber || 'Bus'} Trip Concluded`,
      message: `${bus?.busNumber || 'Bus'} has reached the campus terminal safely. All passengers disembarked.`,
      type: 'info',
      targetBusId: busId,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      priority: 'low',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const advanceNextStop = (busId: string) => {
    setBusLocations((prev) => {
      const loc = prev[busId];
      if (!loc) return prev;
      const bus = buses.find((b) => b.id === busId);
      const route = routes.find((r) => r.id === bus?.routeId);
      if (!route) return prev;

      const nextIdx = Math.min(loc.currentStopIndex + 1, route.stops.length - 1);
      const nextStop = route.stops[nextIdx];

      return {
        ...prev,
        [busId]: {
          ...loc,
          currentStopIndex: nextIdx,
          nextStopId: nextStop ? nextStop.id : '',
          statusMessage: `Arrived at stop ${nextStop ? nextStop.name : 'Terminal'}`,
        },
      };
    });
  };

  const reportIssue = (busId: string, issueType: string, note?: string) => {
    const bus = buses.find((b) => b.id === busId);
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Driver Advisory: ${bus?.busNumber || 'Bus'} - ${issueType}`,
      message: note || `Driver reported ${issueType}. Schedule delayed by approx 10-15 minutes.`,
      type: 'delay',
      targetBusId: busId,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      priority: 'high',
    };
    setNotifications((prev) => [notif, ...prev]);
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, status: 'delayed' as const } : b))
    );
  };

  // Auth & Profile
  const login = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    stopDriverRealGps();
    setUser(null);
  };

  const loginWithGoogle = (
    email = 'g.hariprasadh390@gmail.com',
    name = 'G. Hariprasadh',
    role: UserRole = 'student'
  ): { needsOnboarding: boolean; user: User } => {
    // Check if existing student
    const existing = students.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setUser(existing);
      return { needsOnboarding: false, user: existing };
    }

    // New profile requiring college profile completion
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      studentId: '',
      department: '',
      yearOfStudy: '',
      phone: '',
      collegeName: 'Info Institute of Engineering',
      assignedBusId: 'bus-01',
      assignedStopId: 'stop-sathy-5',
      avatarUrl: '',
    };
    setUser(newUser);
    return { needsOnboarding: role === 'student', user: newUser };
  };

  const completeStudentProfile = (details: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...details };
      // Also update in students directory
      setStudents((all) => {
        const idx = all.findIndex((s) => s.id === updated.id || s.email === updated.email);
        if (idx >= 0) {
          const clone = [...all];
          clone[idx] = updated;
          return clone;
        }
        return [updated, ...all];
      });
      return updated;
    });
  };

  const switchRole = (newRole: UserRole) => {
    stopDriverRealGps();
    if (newRole === 'student') {
      setUser(students[0] || INITIAL_STUDENTS[0]);
    } else if (newRole === 'driver') {
      const driverUser: User = {
        id: 'driver-1',
        name: 'M. Murugesan',
        email: 'murugesan.m@infoengg.edu.in',
        role: 'driver',
        phone: '+91 94432 18901',
        assignedBusId: 'bus-01',
        collegeName: 'Info Institute of Engineering',
      };
      setUser(driverUser);
    } else if (newRole === 'admin') {
      const adminUser: User = {
        id: 'admin-1',
        name: 'Prof. S. Ranganathan',
        email: 'transport.director@infoengg.edu.in',
        role: 'admin',
        phone: '+91 94440 22340',
        department: 'Campus Transport Directorate',
        collegeName: 'Info Institute of Engineering',
      };
      setUser(adminUser);
    }
  };

  // Admin Bus CRUD
  const addBus = (busData: Omit<Bus, 'id'>) => {
    const id = `bus-${Date.now()}`;
    const newBus: Bus = { ...busData, id };
    setBuses((prev) => [...prev, newBus]);
    // Initialize default location
    const route = routes.find((r) => r.id === busData.routeId);
    const startCoord = route?.stops[0]?.coordinates || [11.1385, 77.0375];
    setBusLocations((prev) => ({
      ...prev,
      [id]: {
        busId: id,
        latitude: startCoord[0],
        longitude: startCoord[1],
        speedKmH: 0,
        headingDeg: 0,
        timestamp: Date.now(),
        isLiveGps: false,
        accuracyMeters: 5,
        tripStatus: 'idle',
        currentStopIndex: 0,
        nextStopId: route?.stops[0]?.id || '',
        statusMessage: 'Standby at terminal depot',
      },
    }));
  };

  const updateBus = (id: string, updates: Partial<Bus>) => {
    setBuses((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBus = (id: string) => {
    setBuses((prev) => {
      const remaining = prev.filter((b) => b.id !== id);
      if (activeBusId === id) {
        setActiveBusId(remaining[0]?.id || '');
      }
      return remaining;
    });
    setBusLocations((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const removeAllBuses = () => {
    setBuses([]);
    setBusLocations({});
    setActiveBusId('');
    localStorage.setItem('campustransit_iie_buses', JSON.stringify([]));
    localStorage.setItem('campustransit_iie_locations', JSON.stringify({}));
    broadcastNotification(
      'Fleet Alert: Fleet Cleared',
      'All buses have been removed from the campus fleet by the transport admin.',
      undefined,
      'high'
    );
  };

  const resetDefaultFleet = () => {
    setBuses(INITIAL_BUSES);
    setBusLocations(INITIAL_BUS_LOCATIONS);
    setActiveBusId(INITIAL_BUSES[0]?.id || '');
    localStorage.setItem('campustransit_iie_buses', JSON.stringify(INITIAL_BUSES));
    localStorage.setItem('campustransit_iie_locations', JSON.stringify(INITIAL_BUS_LOCATIONS));
    broadcastNotification(
      'Fleet Restored',
      'Campus fleet has been reset to default configuration (4 active corridors including Sathyamangalam).',
      undefined,
      'low'
    );
  };

  // Admin Driver CRUD
  const addDriver = (driverData: Omit<Driver, 'id'>) => {
    const id = `driver-${Date.now()}`;
    setDrivers((prev) => [...prev, { ...driverData, id }]);
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDriver = (id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  };

  // Admin Route CRUD
  const addRoute = (routeData: Omit<Route, 'id'>) => {
    const id = `route-${Date.now()}`;
    setRoutes((prev) => [...prev, { ...routeData, id }]);
  };

  const assignStudent = (studentId: string, busId: string, stopId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, assignedBusId: busId, assignedStopId: stopId } : s))
    );
    if (user && user.id === studentId) {
      setUser((prev) => (prev ? { ...prev, assignedBusId: busId, assignedStopId: stopId } : null));
    }
  };

  const broadcastNotification = (
    title: string,
    message: string,
    targetBusId?: string,
    priority: 'low' | 'medium' | 'high' = 'high'
  ) => {
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      targetBusId,
      type: priority === 'high' ? 'delay' : 'info',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      priority,
    };
    setNotifications((prev) => [notif, ...prev]);

    if (broadcastRef.current) {
      broadcastRef.current.postMessage({
        type: 'NOTIFICATION_BROADCAST',
        payload: notif,
      });
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        loginWithGoogle,
        completeStudentProfile,
        switchRole,
        buses,
        drivers,
        routes,
        students,
        busLocations,
        trips,
        notifications,
        activeBusId,
        setActiveBusId,
        selectedStopId,
        setSelectedStopId,
        isDarkMode,
        toggleDarkMode,
        driverGpsActive,
        driverGpsStatus,
        driverGpsError,
        startDriverRealGps,
        stopDriverRealGps,
        startTrip,
        endTrip,
        advanceNextStop,
        reportIssue,
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
        markNotificationRead,
        clearAllNotifications,
        isSimulationPlaying,
        toggleSimulationPlay,
        simulationSpeed,
        setSimulationSpeed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
