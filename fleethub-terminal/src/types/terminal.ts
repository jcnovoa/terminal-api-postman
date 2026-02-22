// Terminal API Types
export interface Driver {
  id: string;
  status: 'active' | 'inactive';
  sourceId: string;
  provider: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  license: {
    number: string;
    state: string;
  };
  username?: string;
  groups: string[];
  metadata?: {
    addedAt: string;
    modifiedAt: string;
    visibility: string;
  };
}

export interface Vehicle {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  sourceId: string;
  provider: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: {
    number: string;
    state: string;
  };
  fuelType?: string;
  fuelTankCapacity?: number;
  groups: string[];
  devices: string[];
  metadata?: {
    addedAt: string;
    modifiedAt: string;
    visibility: string;
  };
}

export interface VehicleLocation {
  provider: string;
  vehicle: string;
  driver?: string;
  heading?: number;
  speed?: number;
  odometer?: number;
  engineState?: string;
  locatedAt: string;
  address?: {
    formatted: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  fuel?: {
    primaryPercentage?: number;
  };
  metadata: {
    addedAt: string;
    modifiedAt: string;
  };
}

export interface SafetyEvent {
  id: string;
  type: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  driver?: {
    id: string;
    name: string;
  };
  vehicle?: {
    id: string;
    name: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  speed?: number;
  speedLimit?: number;
  timestamp: string;
}

export interface HOSStatus {
  id: string;
  driver: {
    id: string;
    name: string;
  };
  status: 'driving' | 'on_duty' | 'off_duty' | 'sleeper_berth';
  availableTime?: {
    drive: number;
    shift: number;
    cycle: number;
  };
  lastStatusChange: string;
}

export interface Connection {
  id: string;
  status: 'connected' | 'disconnected' | 'error';
  provider: {
    name: string;
    code: string;
  };
  company: {
    name: string;
    dotNumbers?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  sourceId: string;
  provider: string;
  metadata: {
    addedAt: string;
    modifiedAt: string;
  };
}

export interface Trailer {
  id: string;
  name: string;
  status: string;
  sourceId: string;
  provider: string;
  make?: string;
  model?: string;
  vin?: string;
  year?: number;
  licensePlate?: {
    number: string;
    state: string;
  };
  metadata: {
    addedAt: string;
    modifiedAt: string;
  };
}

export interface APIResponse<T> {
  results: T[];
  pagination?: {
    hasMore: boolean;
    cursor?: string;
  };
}
