import { useState, useEffect } from 'react';
import { Truck, Users, AlertTriangle, Clock, Database } from 'lucide-react';
import { terminalAPI } from './services/terminalAPI';
import type { Driver, Vehicle, SafetyEvent, HOSStatus } from './types/terminal';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [safetyEvents, setSafetyEvents] = useState<SafetyEvent[]>([]);
  const [hosStatus, setHosStatus] = useState<HOSStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [driversRes, vehiclesRes, safetyRes, hosRes] = await Promise.all([
        terminalAPI.getDrivers(),
        terminalAPI.getVehicles(),
        terminalAPI.getSafetyEvents(),
        terminalAPI.getHOSAvailableTime(),
      ]);
      
      setDrivers(driversRes.data);
      setVehicles(vehiclesRes.data);
      setSafetyEvents(safetyRes.data);
      setHosStatus(hosRes.data);
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
              <Database className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 bg-yellow-100 px-3 py-1 rounded-full">Mock Data</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {['dashboard', 'drivers', 'vehicles', 'safety', 'hos'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
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
                                <p className="text-sm text-gray-500">Driver: {event.driverId} • Vehicle: {event.vehicleId}</p>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.licenseNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.licenseState}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {driver.status}
                            </span>
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
                            <p className="text-sm text-gray-500 mt-1">Driver: {event.driverId}</p>
                            <p className="text-sm text-gray-500">Vehicle: {event.vehicleId}</p>
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
                        <tr key={hos.driverId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hos.driverId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hos.driveTimeRemaining.toFixed(1)}h</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hos.shiftTimeRemaining.toFixed(1)}h</td>
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
