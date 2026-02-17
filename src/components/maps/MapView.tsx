import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  center: [number, number];
  radius?: number;
  showRadius?: boolean;
  zoom?: number;
  height?: string;
  onRadiusChange?: (radius: number) => void;
  disabled?: boolean; // disables interactions and visually dims the map (e.g., when a modal is open)
}

const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({
  center,
  radius = 50,
  showRadius = false,
  zoom = 10,
  height = '400px',
  onRadiusChange,
  disabled = false,
}) => {
  return (
    <div
      style={{
        height,
        width: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        filter: disabled ? 'grayscale(100%) brightness(0.7)' : undefined,
        opacity: disabled ? 0.6 : 1,
        zIndex: disabled ? 0 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={false}
      >
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>Your Location</Popup>
        </Marker>
        {showRadius && (
          <Circle
            center={center}
            radius={radius * 1000}
            pathOptions={{
              color: 'hsl(var(--primary))',
              fillColor: 'hsl(var(--primary))',
              fillOpacity: 0.2,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
