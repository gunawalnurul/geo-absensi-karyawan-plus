
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LocationForm from './LocationForm';
import LocationList from './LocationList';

interface GeofenceLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  is_active: boolean;
}

const LocationManagement = () => {
  const [locations, setLocations] = useState<GeofenceLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('geofence_locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data lokasi',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async (locationData: {
    name: string;
    lat: number;
    lng: number;
    radius: number;
  }) => {
    const { error } = await supabase
      .from('geofence_locations')
      .insert(locationData);

    if (error) throw error;
    fetchLocations();
  };

  const handleUpdateLocation = async (location: GeofenceLocation) => {
    const { error } = await supabase
      .from('geofence_locations')
      .update({
        name: location.name,
        lat: location.lat,
        lng: location.lng,
        radius: location.radius,
        is_active: location.is_active
      })
      .eq('id', location.id);

    if (error) throw error;

    toast({
      title: 'Berhasil',
      description: 'Lokasi berhasil diperbarui'
    });

    fetchLocations();
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus lokasi ini?')) return;

    try {
      const { error } = await supabase
        .from('geofence_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Lokasi berhasil dihapus'
      });

      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus lokasi',
        variant: 'destructive'
      });
    }
  };

  const handleToggleLocationStatus = async (location: GeofenceLocation) => {
    try {
      const { error } = await supabase
        .from('geofence_locations')
        .update({ is_active: !location.is_active })
        .eq('id', location.id);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: `Lokasi ${!location.is_active ? 'diaktifkan' : 'dinonaktifkan'}`
      });

      fetchLocations();
    } catch (error) {
      console.error('Error toggling location status:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengubah status lokasi',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <LocationForm onAddLocation={handleAddLocation} />
      <LocationList
        locations={locations}
        onUpdate={handleUpdateLocation}
        onDelete={handleDeleteLocation}
        onToggleStatus={handleToggleLocationStatus}
      />
    </div>
  );
};

export default LocationManagement;
