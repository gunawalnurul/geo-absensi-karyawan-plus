
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LocationMap from './LocationMap';

interface LocationFormProps {
  onAddLocation: (locationData: {
    name: string;
    lat: number;
    lng: number;
    radius: number;
  }) => Promise<void>;
}

const LocationForm = ({ onAddLocation }: LocationFormProps) => {
  const [newLocation, setNewLocation] = useState({
    name: '',
    lat: '',
    lng: '',
    radius: '100'
  });
  const { toast } = useToast();

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

  const handleSubmit = async () => {
    if (!newLocation.name || !newLocation.lat || !newLocation.lng) {
      toast({
        title: 'Error',
        description: 'Semua field harus diisi',
        variant: 'destructive'
      });
      return;
    }

    try {
      await onAddLocation({
        name: newLocation.name,
        lat: parseFloat(newLocation.lat),
        lng: parseFloat(newLocation.lng),
        radius: parseInt(newLocation.radius)
      });

      setNewLocation({ name: '', lat: '', lng: '', radius: '100' });
      toast({
        title: 'Berhasil',
        description: 'Lokasi absen berhasil ditambahkan'
      });
    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan lokasi',
        variant: 'destructive'
      });
    }
  };

  return (
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
          <Button onClick={handleSubmit}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Lokasi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationForm;
