export type UserRole = 'student' | 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  yearOfStudy?: string;
  phone?: string;
  collegeName?: string;
  assignedBusId?: string;
  assignedStopId?: string;
  avatarUrl?: string;
}

export type BusStatus = 'moving' | 'stopped' | 'delayed' | 'offline';

export interface BusStop {
  id: string;
  name: string;
  landmark: string;
  scheduledTime: string;
  coordinates: [number, number]; // [lat, lng]
  sequenceIndex: number;
}

export interface Route {
  id: string;
  routeNumber: string;
  routeName: string;
  startLocation: string;
  endLocation: string;
  totalDistanceKm: number;
  estimatedDurationMin: number;
  stops: BusStop[];
  pathCoordinates: [number, number][]; // Polylines along road network
}

export interface Bus {
  id: string;
  busNumber: string;
  registrationNumber: string;
  capacity: number;
  currentOccupancy: number;
  driverId: string;
  routeId: string;
  status: BusStatus;
  model: string;
  fuelType: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  assignedBusId: string;
  experienceYears: number;
  rating: number;
  avatarUrl: string;
  status: 'on_duty' | 'off_duty' | 'on_break';
}

export interface BusLocation {
  busId: string;
  latitude: number;
  longitude: number;
  speedKmH: number;
  headingDeg: number;
  timestamp: number;
  isLiveGps: boolean; // TRUE: browser Geolocation API; FALSE: Demo simulation
  accuracyMeters?: number;
  tripStatus: 'idle' | 'in_progress' | 'completed' | 'delayed';
  currentStopIndex: number;
  nextStopId: string;
  statusMessage?: string;
}

export interface Trip {
  id: string;
  busId: string;
  driverId: string;
  routeId: string;
  startTime: string;
  endTime?: string;
  tripStatus: 'idle' | 'in_progress' | 'completed' | 'cancelled';
  completedStops: string[];
  delayMinutes: number;
  date: string;
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'delay' | 'approaching' | 'emergency' | 'system';
  targetBusId?: string;
  recipientId?: string;
  createdAt: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}
