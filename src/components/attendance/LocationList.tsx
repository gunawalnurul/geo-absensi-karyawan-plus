
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import LocationItem from './LocationItem';

interface GeofenceLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  is_active: boolean;
}

interface LocationListProps {
  locations: GeofenceLocation[];
  onUpdate: (location: GeofenceLocation) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (location: GeofenceLocation) => Promise<void>;
}

const LocationList = ({ locations, onUpdate, onDelete, onToggleStatus }: LocationListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Daftar Lokasi Absen ({locations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {locations.map((location) => (
            <LocationItem
              key={location.id}
              location={location}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
          {locations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada lokasi absen yang terdaftar
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationList;
