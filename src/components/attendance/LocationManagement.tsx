import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Plus, Edit, Trash2, Navigation, Map } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LocationMap from './LocationMap';

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
  const [editingLocation, setEditingLocation] = useState<GeofenceLocation | null>(null);
  const [newLocation, setNewLocation] = useState({
    name: '',
    lat: '',
    lng: '',
    radius: '100'
  });
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

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewLocation(prev => ({
            ...prev,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          }));
          toast({
            title: 'Lokasi Berhasil Diambil',
            description: 'Koordinat GPS telah diisi otomatis'
          });
        },
        (error) => {
          toast({
            title: 'Error GPS',
            description: 'Tidak dapat mengambil lokasi GPS',
            variant: 'destructive'
          });
        }
      );
    }
  };

  const handleMapLocationSelect = (lat: number, lng: number, address: string) => {
    setNewLocation(prev => ({
      ...prev,
      lat: lat.toString(),
      lng: lng.toString()
    }));
    toast({
      title: 'Lokasi Dipilih',
      description: 'Koordinat dari peta telah diisi otomatis'
    });
  };

  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.lat || !newLocation.lng) {
      toast({
        title: 'Error',
        description: 'Semua field harus diisi',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('geofence_locations')
        .insert({
          name: newLocation.name,
          lat: parseFloat(newLocation.lat),
          lng: parseFloat(newLocation.lng),
          radius: parseInt(newLocation.radius)
        });

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Lokasi absen berhasil ditambahkan'
      });

      setNewLocation({ name: '', lat: '', lng: '', radius: '100' });
      fetchLocations();
    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan lokasi',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation) return;

    try {
      const { error } = await supabase
        .from('geofence_locations')
        .update({
          name: editingLocation.name,
          lat: editingLocation.lat,
          lng: editingLocation.lng,
          radius: editingLocation.radius,
          is_active: editingLocation.is_active
        })
        .eq('id', editingLocation.id);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Lokasi berhasil diperbarui'
      });

      setEditingLocation(null);
      fetchLocations();
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui lokasi',
        variant: 'destructive'
      });
    }
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

  const toggleLocationStatus = async (location: GeofenceLocation) => {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Tambah Lokasi Absen Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Input Manual</TabsTrigger>
              <TabsTrigger value="map">Pilih dari Peta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lokasi</Label>
                  <Input
                    id="name"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Kantor Pusat Jakarta"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="radius">Radius (meter)</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={newLocation.radius}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, radius: e.target.value }))}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <div className="flex gap-2">
                    <Input
                      id="lat"
                      value={newLocation.lat}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, lat: e.target.value }))}
                      placeholder="-6.200000"
                    />
                    <Button variant="outline" onClick={getCurrentLocation}>
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    value={newLocation.lng}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, lng: e.target.value }))}
                    placeholder="106.816666"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="map" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="map-name">Nama Lokasi</Label>
                  <Input
                    id="map-name"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Kantor Pusat Jakarta"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="map-radius">Radius (meter)</Label>
                  <Input
                    id="map-radius"
                    type="number"
                    value={newLocation.radius}
                    onChange={(e) => setNewLocation(prev => ({ ...prev, radius: e.target.value }))}
                    placeholder="100"
                  />
                </div>
                <LocationMap onLocationSelect={handleMapLocationSelect} />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={handleAddLocation}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Lokasi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Locations */}
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
              <div key={location.id} className="border rounded-lg p-4">
                {editingLocation?.id === location.id ? (
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
                      <Button onClick={handleUpdateLocation}>Simpan</Button>
                      <Button variant="outline" onClick={() => setEditingLocation(null)}>
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : (
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
                        onClick={() => toggleLocationStatus(location)}
                      >
                        {location.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingLocation(location)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteLocation(location.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {locations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Belum ada lokasi absen yang terdaftar
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationManagement;
