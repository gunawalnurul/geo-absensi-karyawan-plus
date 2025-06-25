
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const GeofenceSettings = () => {
  const [globalSettings, setGlobalSettings] = useState({
    defaultRadius: 100,
    strictMode: false,
    allowOutOfTownAccess: true,
    workingHours: {
      start: '08:00',
      end: '17:00'
    },
    lateThreshold: 15 // minutes
  });
  const [statistics, setStatistics] = useState({
    totalLocations: 0,
    activeLocations: 0,
    todayAttendance: 0,
    outOfAreaAttempts: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Get locations count
      const { data: locations } = await supabase
        .from('geofence_locations')
        .select('id, is_active');

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: attendance } = await supabase
        .from('attendance')
        .select('id, is_out_of_town_access')
        .eq('date', today);

      setStatistics({
        totalLocations: locations?.length || 0,
        activeLocations: locations?.filter(l => l.is_active).length || 0,
        todayAttendance: attendance?.length || 0,
        outOfAreaAttempts: attendance?.filter(a => a.is_out_of_town_access).length || 0
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSaveSettings = () => {
    // In a real app, you would save these settings to a settings table
    toast({
      title: 'Berhasil',
      description: 'Pengaturan geofencing telah disimpan'
    });
  };

  const handleTestGeofence = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({
            title: 'Test Geofence',
            description: `Lokasi saat ini: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
          });
        },
        (error) => {
          toast({
            title: 'Error GPS',
            description: 'Tidak dapat mengambil lokasi untuk test',
            variant: 'destructive'
          });
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{statistics.totalLocations}</p>
                <p className="text-xs text-gray-500">Total Lokasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{statistics.activeLocations}</p>
                <p className="text-xs text-gray-500">Lokasi Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{statistics.todayAttendance}</p>
                <p className="text-xs text-gray-500">Absen Hari Ini</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{statistics.outOfAreaAttempts}</p>
                <p className="text-xs text-gray-500">Akses Luar Area</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Pengaturan Global Geofencing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultRadius">Radius Default (meter)</Label>
              <Input
                id="defaultRadius"
                type="number"
                value={globalSettings.defaultRadius}
                onChange={(e) => setGlobalSettings(prev => ({ 
                  ...prev, 
                  defaultRadius: parseInt(e.target.value) 
                }))}
                placeholder="100"
              />
              <p className="text-sm text-gray-500">
                Radius default untuk lokasi baru
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lateThreshold">Batas Telat (menit)</Label>
              <Input
                id="lateThreshold"
                type="number"
                value={globalSettings.lateThreshold}
                onChange={(e) => setGlobalSettings(prev => ({ 
                  ...prev, 
                  lateThreshold: parseInt(e.target.value) 
                }))}
                placeholder="15"
              />
              <p className="text-sm text-gray-500">
                Toleransi keterlambatan dalam menit
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startTime">Jam Kerja Mulai</Label>
              <Input
                id="startTime"
                type="time"
                value={globalSettings.workingHours.start}
                onChange={(e) => setGlobalSettings(prev => ({ 
                  ...prev, 
                  workingHours: { ...prev.workingHours, start: e.target.value }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Jam Kerja Selesai</Label>
              <Input
                id="endTime"
                type="time"
                value={globalSettings.workingHours.end}
                onChange={(e) => setGlobalSettings(prev => ({ 
                  ...prev, 
                  workingHours: { ...prev.workingHours, end: e.target.value }
                }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Mode Ketat</Label>
                <p className="text-sm text-gray-500">
                  Hanya izinkan absen dalam radius yang ketat
                </p>
              </div>
              <Switch
                checked={globalSettings.strictMode}
                onCheckedChange={(checked) => setGlobalSettings(prev => ({ 
                  ...prev, 
                  strictMode: checked 
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Izin Akses Luar Kota</Label>
                <p className="text-sm text-gray-500">
                  Memungkinkan karyawan absen dari luar area geofence
                </p>
              </div>
              <Switch
                checked={globalSettings.allowOutOfTownAccess}
                onCheckedChange={(checked) => setGlobalSettings(prev => ({ 
                  ...prev, 
                  allowOutOfTownAccess: checked 
                }))}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSaveSettings}>
              Simpan Pengaturan
            </Button>
            <Button variant="outline" onClick={handleTestGeofence}>
              Test Geofence
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            Informasi Penting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">GPS</Badge>
              <div>
                <p className="font-medium">Akurasi GPS</p>
                <p className="text-gray-600">
                  Akurasi GPS biasanya 3-5 meter di area terbuka. Pertimbangkan hal ini saat menentukan radius geofence.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">Radius</Badge>
              <div>
                <p className="font-medium">Rekomendasi Radius</p>
                <p className="text-gray-600">
                  Radius minimum 50m untuk area terbuka, 100m untuk area perkotaan, dan 200m untuk area dengan bangunan tinggi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">Baterai</Badge>
              <div>
                <p className="font-medium">Penggunaan Baterai</p>
                <p className="text-gray-600">
                  Fitur GPS kontinyu dapat menguras baterai. Informasikan kepada karyawan untuk selalu mempersiapkan charger.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeofenceSettings;
