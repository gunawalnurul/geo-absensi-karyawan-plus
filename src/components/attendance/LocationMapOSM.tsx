
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapOSMProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

const LocationMapOSM = ({ onLocationSelect, initialLat, initialLng }: LocationMapOSMProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current, {
      center: initialLat && initialLng ? [initialLat, initialLng] : [-6.200000, 106.816666], // Jakarta coordinates
      zoom: initialLat && initialLng ? 15 : 10
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.current);

    // Add click event to map
    map.current.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      // Remove existing marker
      if (marker.current) {
        map.current?.removeLayer(marker.current);
      }
      
      // Add new marker
      marker.current = L.marker([lat, lng]).addTo(map.current!);
      
      setSelectedLocation({ lat, lng });
      
      // Simple address format (in production you'd use reverse geocoding)
      const address = `Lokasi: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onLocationSelect(lat, lng, address);
    });

    // Add initial marker if coordinates provided
    if (initialLat && initialLng) {
      marker.current = L.marker([initialLat, initialLng]).addTo(map.current);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [initialLat, initialLng, onLocationSelect]);

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          if (map.current) {
            map.current.setView([lat, lng], 15);
            
            // Remove existing marker
            if (marker.current) {
              map.current.removeLayer(marker.current);
            }
            
            // Add new marker
            marker.current = L.marker([lat, lng]).addTo(map.current);
            
            setSelectedLocation({ lat, lng });
            const address = `Lokasi GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            onLocationSelect(lat, lng, address);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium">Pilih Lokasi dari Peta</h3>
        </div>
        <Button variant="outline" size="sm" onClick={getCurrentLocation}>
          Lokasi Saya
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

export default LocationMapOSM;
