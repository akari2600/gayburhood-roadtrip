import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import { Icon } from 'leaflet';
import { routes, tripStats } from './routeData';

interface Accommodation {
  id: number;
  city: string;
  check_in: string;
  check_out: string;
  beds: number;
  airbnb_link: string | null;
}

interface Activity {
  id: number;
  date: string;
  title: string;
  description: string | null;
  link: string | null;
}

interface MapViewProps {
  accommodations: Accommodation[];
  activities: Activity[];
}

// Temporary coordinates for cities (we'll populate from database later)
const cityCoordinates: { [key: string]: [number, number] } = {
  'Memphis': [35.1495, -90.0490],
  'Atlanta': [33.7490, -84.3880],
  'Savannah': [32.0809, -81.0912],
  'Panama City Beach': [30.1766, -85.8055],
  'New Orleans': [29.9511, -90.0715],
  'Houston': [29.7604, -95.3698],
  'Waco': [31.5493, -97.1467],
};

export default function MapView({ accommodations, activities }: MapViewProps) {
  // Get unique cities in order of check-in dates
  const routePoints = accommodations
    .sort((a, b) => a.check_in.localeCompare(b.check_in))
    .map(accom => ({
      city: accom.city,
      coordinates: cityCoordinates[accom.city] || [0, 0],
      ...accom
    }))
    .filter(point => point.coordinates[0] !== 0);

  // Calculate center point (roughly middle of the route)
  const centerLat = routePoints.reduce((sum, p) => sum + p.coordinates[0], 0) / routePoints.length;
  const centerLng = routePoints.reduce((sum, p) => sum + p.coordinates[1], 0) / routePoints.length;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          color: '#667eea', 
          marginBottom: '30px',
          fontSize: '2.2em'
        }}>
          🗺️ Road Trip Route Map
        </h1>

        <div style={{ 
          height: '600px', 
          borderRadius: '12px', 
          overflow: 'hidden',
          border: '2px solid #e0e0e0'
        }}>
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Draw route line */}
            {routePoints.length > 1 && (
              <Polyline
                positions={routePoints.map(p => p.coordinates)}
                color="#667eea"
                weight={4}
                opacity={0.7}
              />
            )}

            {/* Add markers for each city */}
            {routePoints.map((point, index) => (
              <Marker
                key={point.id}
                position={point.coordinates}
              >
                <Popup>
                  <div style={{ padding: '10px' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>
                      {index + 1}. {point.city}
                    </h3>
                    <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                      <strong>Check in:</strong> {new Date(point.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                      <strong>Check out:</strong> {new Date(point.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                      <strong>Beds:</strong> {point.beds}
                    </p>
                    {point.airbnb_link && (
                      <a 
                        href={point.airbnb_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#667eea', fontSize: '0.9em' }}
                      >
                        View Airbnb →
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div style={{ marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#667eea' }}>Trip Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ padding: '15px', background: 'white', borderRadius: '8px', border: '2px solid #667eea' }}>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#667eea' }}>
                {tripStats.total_miles}
              </div>
              <div style={{ color: '#666', fontSize: '0.9em' }}>Total Miles</div>
            </div>
            <div style={{ padding: '15px', background: 'white', borderRadius: '8px', border: '2px solid #f5576c' }}>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#f5576c' }}>
                {tripStats.total_hours}
              </div>
              <div style={{ color: '#666', fontSize: '0.9em' }}>Driving Hours</div>
            </div>
            <div style={{ padding: '15px', background: 'white', borderRadius: '8px', border: '2px solid #66bb6a' }}>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#66bb6a' }}>
                {routePoints.length}
              </div>
              <div style={{ color: '#666', fontSize: '0.9em' }}>Cities</div>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
            <p>📍 Click on markers to see accommodation details</p>
            <p>🛣️ Route segments:</p>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              {routes.map((route, idx) => (
                <li key={idx}>
                  {route.from} → {route.to}: <strong>{route.distance_miles} mi</strong> ({route.duration_hours} hrs)
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

