// Terminal API Types
export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseState: string;
  status: 'active' | 'inactive';
  email?: string;
  phone?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  status?: string;
}

export interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  address?: string;
  speed?: number;
  heading?: number;
  timestamp: string;
}

export interface SafetyEvent {
  id: string;
  type: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  driverId: string;
  vehicleId: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface HOSStatus {
  driverId: string;
  driveTimeRemaining: number;
  shiftTimeRemaining: number;
  cycleTimeRemaining?: number;
  status: 'driving' | 'on_duty' | 'off_duty' | 'sleeper';
  lastUpdated: string;
}

export interface Connection {
  id: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  companyName: string;
  createdAt: string;
}

export interface APIResponse<T> {
  data: T[];
  pagination?: {
    hasMore: boolean;
    cursor?: string;
  };
}
