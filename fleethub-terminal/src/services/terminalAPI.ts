import type { Driver, Vehicle, VehicleLocation, SafetyEvent, HOSStatus, Connection, APIResponse } from '../types/terminal';

const API_BASE_URL = 'https://wer6tsu3ul.execute-api.us-east-1.amazonaws.com/api';

export const terminalAPI = {
  // Connections
  getConnections: async (): Promise<APIResponse<Connection>> => {
    const response = await fetch(`${API_BASE_URL}/connections`);
    return response.json();
  },

  // Drivers
  getDrivers: async (): Promise<APIResponse<Driver>> => {
    const response = await fetch(`${API_BASE_URL}/drivers`);
    return response.json();
  },

  getDriver: async (id: string): Promise<Driver> => {
    const response = await fetch(`${API_BASE_URL}/drivers/${id}`);
    const data = await response.json();
    return data.data;
  },

  // Vehicles
  getVehicles: async (): Promise<APIResponse<Vehicle>> => {
    const response = await fetch(`${API_BASE_URL}/vehicles`);
    return response.json();
  },

  getVehicle: async (id: string): Promise<Vehicle> => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`);
    const data = await response.json();
    return data.data;
  },

  getVehicleLocations: async (): Promise<APIResponse<VehicleLocation>> => {
    const response = await fetch(`${API_BASE_URL}/vehicles/locations`);
    return response.json();
  },

  // Safety Events
  getSafetyEvents: async (): Promise<APIResponse<SafetyEvent>> => {
    const response = await fetch(`${API_BASE_URL}/safety/events`);
    return response.json();
  },

  // Hours of Service
  getHOSAvailableTime: async (): Promise<APIResponse<HOSStatus>> => {
    const response = await fetch(`${API_BASE_URL}/hos/available-time`);
    return response.json();
  },
};
