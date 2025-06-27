
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

interface GeofenceLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  is_active: boolean;
}

interface LocationItemProps {
  location: GeofenceLocation;
  onUpdate: (location: GeofenceLocation) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (location: GeofenceLocation) => Promise<void>;
}

const LocationItem = ({ location, onUpdate, onDelete, onToggleStatus }: LocationItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingLocation, setEditingLocation] = useState<GeofenceLocation>(location);

  const handleUpdate = async () => {
    try {
      await onUpdate(editingLocation);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleCancel = () => {
    setEditingLocation(location);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="border rounded-lg p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nama Lokasi</Label>
              <Input
                value={editingLocation.name}
                onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Radius (meter)</Label>
              <Input
                type="number"
                value={editingLocation.radius}
                onChange={(e) => setEditingLocation({ ...editingLocation, radius: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Latitude</Label>
              <Input
                value={editingLocation.lat}
                onChange={(e) => setEditingLocation({ ...editingLocation, lat: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                value={editingLocation.lng}
                onChange={(e) => setEditingLocation({ ...editingLocation, lng: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUpdate}>Simpan</Button>
            <Button variant="outline" onClick={handleCancel}>
              Batal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{location.name}</h3>
            <Badge variant={location.is_active ? "default" : "secondary"}>
              {location.is_active ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Koordinat: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
          <p className="text-sm text-gray-600">
            Radius: {location.radius}m
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(location)}
          >
            {location.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(location.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationItem;
