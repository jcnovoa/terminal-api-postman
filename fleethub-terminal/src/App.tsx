import { useState, useEffect } from 'react';
import { Truck, Users, AlertTriangle, Clock, Database } from 'lucide-react';
import { terminalAPI } from './services/terminalAPI';
import { VehicleMap } from './components/VehicleMap';
import type { Driver, Vehicle, SafetyEvent, HOSStatus, Connection, VehicleLocation, Group, Trailer } from './types/terminal';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleLocations, setVehicleLocations] = useState<VehicleLocation[]>([]);
  const [safetyEvents, setSafetyEvents] = useState<SafetyEvent[]>([]);
  const [hosStatus, setHosStatus] = useState<HOSStatus[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // API Playground state
  const [apiRequest, setApiRequest] = useState({
    method: 'GET',
    endpoint: '/drivers',
    body: ''
  });
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const terminalEndpoints = [
    '/drivers',
    '/vehicles',
    '/vehicles/locations',
    '/safety/events',
    '/hos/available-time',
    '/groups',
    '/trailers',
    '/connections'
  ];

  const handleApiTest = async () => {
    setApiLoading(true);
    setApiResponse(null);
    try {
      const url = `https://wer6tsu3ul.execute-api.us-east-1.amazonaws.com/api${apiRequest.endpoint}`;
      const response = await fetch(url, {
        method: apiRequest.method,
        headers: { 'Content-Type': 'application/json' },
        body: apiRequest.method !== 'GET' ? apiRequest.body : undefined
      });
      const data = await response.json();
      setApiResponse({
        status: response.status,
        statusText: response.statusText,
        data,
        requestUrl: url
      });
    } catch (error: any) {
      setApiResponse({ error: error.message });
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [driversRes, vehiclesRes, locationsRes, safetyRes, hosRes, connectionsRes, groupsRes, trailersRes] = await Promise.all([
        terminalAPI.getDrivers(),
        terminalAPI.getVehicles(),
        terminalAPI.getVehicleLocations(),
        terminalAPI.getSafetyEvents(),
        terminalAPI.getHOSAvailableTime(),
        terminalAPI.getConnections(),
        terminalAPI.getGroups(),
        terminalAPI.getTrailers(),
      ]);
      
      setDrivers(driversRes.results || []);
      setVehicles(vehiclesRes.results || []);
      setVehicleLocations(locationsRes.results || []);
      setSafetyEvents(safetyRes.results || []);
      setHosStatus(hosRes.results || []);
      setConnections(connectionsRes.results || []);
      setGroups(groupsRes.results || []);
      setTrailers(trailersRes.results || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Truck className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">FleetHub Terminal</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700 bg-green-100 px-3 py-1 rounded-full font-medium">Terminal API</span>
              <span className="text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded">Sandbox</span>
              <span className="text-xs text-gray-400 ml-2">
                Updated {Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s ago
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {['dashboard', 'map', 'drivers', 'vehicles', 'groups', 'users', 'assets', 'safety', 'hos', 'maintenance', 'admin'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'hos' ? 'HOS' : tab === 'admin' ? 'Admin Console' : tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Drivers</p>
                        <p className="text-3xl font-bold text-gray-900">{drivers.length}</p>
                      </div>
                      <Users className="w-12 h-12 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Vehicles</p>
                        <p className="text-3xl font-bold text-gray-900">{vehicles.length}</p>
                      </div>
                      <Truck className="w-12 h-12 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Safety Events</p>
                        <p className="text-3xl font-bold text-gray-900">{safetyEvents.length}</p>
                      </div>
                      <AlertTriangle className="w-12 h-12 text-yellow-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">HOS Tracked</p>
                        <p className="text-3xl font-bold text-gray-900">{hosStatus.length}</p>
                      </div>
                      <Clock className="w-12 h-12 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Safety Events</h2>
                  </div>
                  <div className="p-6">
                    {safetyEvents.length > 0 ? (
                      <div className="space-y-4">
                        {safetyEvents.map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <AlertTriangle className={`w-6 h-6 ${
                                event.severity === 'critical' ? 'text-red-500' :
                                event.severity === 'high' ? 'text-orange-500' :
                                event.severity === 'moderate' ? 'text-yellow-500' :
                                'text-blue-500'
                              }`} />
                              <div>
                                <p className="font-medium text-gray-900 capitalize">{event.type.replace('_', ' ')}</p>
                                <p className="text-sm text-gray-500">
                                  {event.driver?.name || 'Unknown Driver'} • {event.vehicle?.name || 'Unknown Vehicle'}
                                </p>
                                {event.location?.address && (
                                  <p className="text-xs text-gray-400 mt-1">{event.location.address}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No safety events</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Live Operations</h2>
                <div className="h-[600px]">
                  <VehicleMap locations={vehicleLocations} vehicles={vehicles} />
                </div>
              </div>
            )}

            {activeTab === 'drivers' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Drivers ({drivers.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {drivers.map((driver) => (
                        <tr key={driver.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{driver.firstName} {driver.lastName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.license.number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.license.state}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {driver.status}
                              </span>
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                                {driver.provider}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'vehicles' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Vehicles ({vehicles.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make/Model</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIN</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{vehicle.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.make} {vehicle.model}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.year}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{vehicle.vin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Groups ({groups.length})</h2>
                  <p className="text-sm text-gray-500 mt-1">Fleet organization groups</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groups.map((group) => (
                        <tr key={group.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{group.sourceId}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                              {group.provider}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                  <p className="text-sm text-gray-500 mt-1">User management</p>
                </div>
                <div className="p-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 font-medium">⚠️ Feature Not Available</p>
                    <p className="text-yellow-700 text-sm mt-2">Terminal API does not provide a /users endpoint. User management is not supported.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Assets - Trailers ({trailers.length})</h2>
                  <p className="text-sm text-gray-500 mt-1">Non-powered assets</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make/Model</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License Plate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIN</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trailers.map((trailer) => (
                        <tr key={trailer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trailer.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trailer.make} {trailer.model}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trailer.year}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {trailer.licensePlate?.number} ({trailer.licensePlate?.state})
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{trailer.vin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Maintenance (DVIR)</h2>
                  <p className="text-sm text-gray-500 mt-1">Driver Vehicle Inspection Reports</p>
                </div>
                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">❌ Feature Not Available</p>
                    <p className="text-red-700 text-sm mt-2">Terminal API does not provide inspection/DVIR endpoints. This is a critical gap for DOT compliance.</p>
                    <p className="text-red-600 text-xs mt-2">VZC provides: /inspections/reports, /inspections/defects, /inspections/templates</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="space-y-6">
                {/* Connections */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Connections</h2>
                    <p className="text-sm text-gray-500 mt-1">Active TSP connections</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {connections.map((conn) => (
                          <tr key={conn.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                                {conn.provider.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {conn.company.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                conn.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {conn.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(conn.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* API Playground */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">API Playground</h2>
                    <p className="text-sm text-gray-500 mt-1">Test Terminal API endpoints</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex space-x-4">
                      <select 
                        value={apiRequest.method}
                        onChange={(e) => setApiRequest({...apiRequest, method: e.target.value})}
                        className="p-2 border border-gray-300 rounded-md text-sm font-semibold w-32"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                      </select>
                      
                      <select 
                        value={apiRequest.endpoint}
                        onChange={(e) => setApiRequest({...apiRequest, endpoint: e.target.value})}
                        className="flex-1 p-2 border border-gray-300 rounded-md text-sm font-mono"
                      >
                        {terminalEndpoints.map((ep) => (
                          <option key={ep} value={ep}>{ep}</option>
                        ))}
                      </select>

                      <button 
                        onClick={handleApiTest}
                        disabled={apiLoading}
                        className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      >
                        {apiLoading ? 'Loading...' : 'Send'}
                      </button>
                    </div>

                    {apiRequest.method === 'POST' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Request Body</label>
                        <textarea 
                          value={apiRequest.body}
                          onChange={(e) => setApiRequest({...apiRequest, body: e.target.value})}
                          className="w-full h-32 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none"
                          placeholder='{ "key": "value" }'
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Response</label>
                      {apiResponse?.requestUrl && (
                        <div className="mb-2 text-xs text-gray-600 bg-gray-100 p-2 rounded border border-gray-200 font-mono break-all">
                          <strong>Request URL:</strong> {apiResponse.requestUrl}
                        </div>
                      )}
                      <div className="w-full h-64 p-4 bg-slate-900 rounded-md overflow-auto font-mono text-xs text-green-400 border border-slate-700">
                        {apiResponse ? (
                          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                        ) : (
                          <span className="text-slate-500">// Response will appear here...</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'safety' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Safety Events ({safetyEvents.length})</h2>
                </div>
                <div className="p-6 space-y-4">
                  {safetyEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <AlertTriangle className={`w-6 h-6 mt-1 ${
                            event.severity === 'critical' ? 'text-red-500' :
                            event.severity === 'high' ? 'text-orange-500' :
                            event.severity === 'moderate' ? 'text-yellow-500' :
                            'text-blue-500'
                          }`} />
                          <div>
                            <h3 className="font-medium text-gray-900 capitalize">{event.type.replace('_', ' ')}</h3>
                            <p className="text-sm text-gray-500 mt-1">Driver: {event.driver?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">Vehicle: {event.vehicle?.name || 'Unknown'}</p>
                            {event.location?.address && (
                              <p className="text-xs text-gray-400 mt-1">{event.location.address}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-2">{new Date(event.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          event.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {event.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'hos' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Hours of Service ({hosStatus.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drive Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {hosStatus.map((hos) => (
                        <tr key={hos.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hos.driver.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {hos.availableTime?.drive?.toFixed(1) || 'N/A'}h
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {hos.availableTime?.shift?.toFixed(1) || 'N/A'}h
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                              hos.status === 'driving' ? 'bg-green-100 text-green-800' :
                              hos.status === 'on_duty' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {hos.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </>
        )}
      </main>
    </div>
  );
}

export default App;
