import type { Driver, Vehicle, VehicleLocation, SafetyEvent, HOSStatus, Connection, Group, Trailer, APIResponse } from '../types/terminal';

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

  // Vehicles
  getVehicles: async (): Promise<APIResponse<Vehicle>> => {
    const response = await fetch(`${API_BASE_URL}/vehicles`);
    return response.json();
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

  // Groups
  getGroups: async (): Promise<APIResponse<Group>> => {
    const response = await fetch(`${API_BASE_URL}/groups`);
    return response.json();
  },

  // Trailers
  getTrailers: async (): Promise<APIResponse<Trailer>> => {
    const response = await fetch(`${API_BASE_URL}/trailers`);
    return response.json();
  },
};
