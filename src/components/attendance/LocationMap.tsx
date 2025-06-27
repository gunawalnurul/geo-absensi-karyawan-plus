
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

const LocationMap = ({ onLocationSelect, initialLat, initialLng }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [106.816666, -6.200000], // Jakarta coordinates
      zoom: 10
    });

    // Add click event to map
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      
      // Remove existing marker
      if (marker.current) {
        marker.current.remove();
      }
      
      // Add new marker
      marker.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map.current!);
      
      setSelectedLocation({ lat, lng });
      
      // Get address (simplified - in production you'd use reverse geocoding)
      const address = `Lokasi: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onLocationSelect(lat, lng, address);
    });

    // Add initial marker if coordinates provided
    if (initialLat && initialLng) {
      marker.current = new mapboxgl.Marker()
        .setLngLat([initialLng, initialLat])
        .addTo(map.current);
      
      map.current.setCenter([initialLng, initialLat]);
      map.current.setZoom(15);
    }
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      setTimeout(initializeMap, 100); // Small delay to ensure container is visible
    }
  };

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  if (showTokenInput) {
    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium">Konfigurasi Peta</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mapbox-token">Mapbox Access Token</Label>
          <Input
            id="mapbox-token"
            type="password"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            placeholder="Masukkan Mapbox Access Token"
          />
          <p className="text-sm text-gray-600">
            Dapatkan token gratis di{' '}
            <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              mapbox.com
            </a>
          </p>
        </div>
        <Button onClick={handleTokenSubmit} disabled={!mapboxToken.trim()}>
          Tampilkan Peta
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium">Pilih Lokasi dari Peta</h3>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowTokenInput(true)}>
          Ganti Token
        </Button>
      </div>
      
      <div 
        ref={mapContainer} 
        className="w-full h-96 rounded-lg border"
        style={{ minHeight: '400px' }}
      />
      
      {selectedLocation && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Lokasi Terpilih:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Klik pada peta untuk memilih lokasi yang berbeda
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationMap;
