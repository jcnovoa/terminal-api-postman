import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface VehicleLocation {
  vehicle: string;
  location: {
    latitude: number;
    longitude: number;
  };
  speed?: number;
  engineState?: string;
  address?: {
    formatted: string;
  };
}

interface Vehicle {
  id: string;
  name: string;
  make?: string;
  model?: string;
}

interface VehicleMapProps {
  locations: VehicleLocation[];
  vehicles: Vehicle[];
  center?: { lat: number; lng: number } | null;
}

const MapController = ({ center }: { center?: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  
  return null;
};

export const VehicleMap = ({ locations, vehicles, center: externalCenter }: VehicleMapProps) => {
  const defaultCenter: [number, number] = locations.length > 0
    ? [
        locations.reduce((sum, l) => sum + l.location.latitude, 0) / locations.length,
        locations.reduce((sum, l) => sum + l.location.longitude, 0) / locations.length
      ]
    : [39.8283, -98.5795];

  const center: [number, number] = externalCenter 
    ? [externalCenter.lat, externalCenter.lng]
    : defaultCenter;

  const zoom = locations.length > 0 ? 10 : 4;

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapController center={center} />
      {locations.map((loc, idx) => {
        const vehicle = vehicles.find(v => v.id === loc.vehicle);
        return (
          <Marker 
            key={idx}
            position={[loc.location.latitude, loc.location.longitude]}
          >
            <Popup>
              <div className="text-sm">
                <strong className="text-base">{vehicle?.name || 'Unknown'}</strong><br/>
                <span className="text-gray-600">{vehicle?.make} {vehicle?.model}</span><br/>
                <hr className="my-1"/>
                <strong>Status:</strong> {loc.engineState || 'Unknown'}<br/>
                <strong>Speed:</strong> {loc.speed || 0} km/h<br/>
                {loc.address?.formatted && (
                  <><strong>Location:</strong> {loc.address.formatted}</>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};
