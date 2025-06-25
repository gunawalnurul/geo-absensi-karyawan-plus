
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, Users, Settings } from 'lucide-react';
import LocationManagement from '../components/attendance/LocationManagement';
import GeofenceSettings from '../components/attendance/GeofenceSettings';
import AttendanceRecords from '../components/attendance/AttendanceRecords';
import AttendanceSettings from '../components/attendance/AttendanceSettings';

const AttendanceManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Absensi</h1>
      </div>

      <Tabs defaultValue="locations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Lokasi Absen
          </TabsTrigger>
          <TabsTrigger value="geofence" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Geofencing
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Data Absensi
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Pengaturan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="locations">
          <LocationManagement />
        </TabsContent>

        <TabsContent value="geofence">
          <GeofenceSettings />
        </TabsContent>

        <TabsContent value="records">
          <AttendanceRecords />
        </TabsContent>

        <TabsContent value="settings">
          <AttendanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceManagement;
