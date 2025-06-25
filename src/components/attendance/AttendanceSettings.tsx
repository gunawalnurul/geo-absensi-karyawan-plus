
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Bell, Shield, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AttendanceSettings = () => {
  const [settings, setSettings] = useState({
    // Work Schedule Settings
    workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workHours: {
      start: '08:00',
      end: '17:00',
      breakStart: '12:00',
      breakEnd: '13:00'
    },
    
    // Attendance Rules
    lateThreshold: 15, // minutes
    earliestCheckIn: '06:00',
    latestCheckOut: '20:00',
    minimumWorkHours: 8,
    
    // Notifications
    enableNotifications: true,
    notifyLateEmployees: true,
    notifyMissedCheckout: true,
    reminderTime: '08:15',
    
    // Security & Privacy
    requirePhotoCapture: false,
    saveLocationHistory: true,
    anonymizeLocationData: false,
    dataRetentionDays: 365,
    
    // Advanced Features
    allowOfflineSync: true,
    enableBiometricAuth: false,
    requireManagerApproval: false,
    autoCalculateOvertime: true
  });

  const { toast } = useToast();

  const handleSettingChange = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleWorkDayToggle = (day: string) => {
    setSettings(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day]
    }));
  };

  const handleSaveSettings = () => {
    // In a real app, save to database
    toast({
      title: 'Berhasil',
      description: 'Pengaturan absensi telah disimpan'
    });
  };

  const resetToDefaults = () => {
    // Reset to default settings
    toast({
      title: 'Reset Berhasil',
      description: 'Pengaturan dikembalikan ke default'
    });
  };

  const workDayLabels = {
    monday: 'Senin',
    tuesday: 'Selasa',
    wednesday: 'Rabu',
    thursday: 'Kamis',
    friday: 'Jumat',
    saturday: 'Sabtu',
    sunday: 'Minggu'
  };

  return (
    <div className="space-y-6">
      {/* Work Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Jadwal Kerja
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">Hari Kerja</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(workDayLabels).map(([day, label]) => (
                <div key={day} className="flex items-center space-x-2">
                  <Switch
                    checked={settings.workDays.includes(day)}
                    onCheckedChange={() => handleWorkDayToggle(day)}
                  />
                  <Label className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Jam Masuk</Label>
              <Input
                type="time"
                value={settings.workHours.start}
                onChange={(e) => handleSettingChange('workHours.start', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Jam Pulang</Label>
              <Input
                type="time"
                value={settings.workHours.end}
                onChange={(e) => handleSettingChange('workHours.end', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Mulai Istirahat</Label>
              <Input
                type="time"
                value={settings.workHours.breakStart}
                onChange={(e) => handleSettingChange('workHours.breakStart', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Selesai Istirahat</Label>
              <Input
                type="time"
                value={settings.workHours.breakEnd}
                onChange={(e) => handleSettingChange('workHours.breakEnd', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Aturan Absensi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Batas Telat (menit)</Label>
              <Input
                type="number"
                value={settings.lateThreshold}
                onChange={(e) => handleSettingChange('lateThreshold', parseInt(e.target.value))}
                placeholder="15"
              />
            </div>
            <div className="space-y-2">
              <Label>Minimal Jam Kerja</Label>
              <Input
                type="number"
                value={settings.minimumWorkHours}
                onChange={(e) => handleSettingChange('minimumWorkHours', parseInt(e.target.value))}
                placeholder="8"
              />
            </div>
            <div className="space-y-2">
              <Label>Retensi Data (hari)</Label>
              <Input
                type="number"
                value={settings.dataRetentionDays}
                onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                placeholder="365"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jam Check-in Paling Awal</Label>
              <Input
                type="time"
                value={settings.earliestCheckIn}
                onChange={(e) => handleSettingChange('earliestCheckIn', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Jam Check-out Paling Akhir</Label>
              <Input
                type="time"
                value={settings.latestCheckOut}
                onChange={(e) => handleSettingChange('latestCheckOut', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Aktifkan Notifikasi</Label>
                <p className="text-sm text-gray-500">Kirim notifikasi untuk event absensi</p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notifikasi Keterlambatan</Label>
                <p className="text-sm text-gray-500">Beritahu admin saat karyawan terlambat</p>
              </div>
              <Switch
                checked={settings.notifyLateEmployees}
                onCheckedChange={(checked) => handleSettingChange('notifyLateEmployees', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notifikasi Lupa Check-out</Label>
                <p className="text-sm text-gray-500">Ingatkan karyawan yang lupa check-out</p>
              </div>
              <Switch
                checked={settings.notifyMissedCheckout}
                onCheckedChange={(checked) => handleSettingChange('notifyMissedCheckout', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Waktu Pengingat Harian</Label>
            <Input
              type="time"
              value={settings.reminderTime}
              onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Waktu untuk mengirim pengingat harian kepada karyawan
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Keamanan & Privasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Wajib Foto Selfie</Label>
                <p className="text-sm text-gray-500">Karyawan harus mengambil foto saat absen</p>
              </div>
              <Switch
                checked={settings.requirePhotoCapture}
                onCheckedChange={(checked) => handleSettingChange('requirePhotoCapture', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Simpan Riwayat Lokasi</Label>
                <p className="text-sm text-gray-500">Menyimpan data GPS untuk audit</p>
              </div>
              <Switch
                checked={settings.saveLocationHistory}
                onCheckedChange={(checked) => handleSettingChange('saveLocationHistory', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Anonimkan Data Lokasi</Label>
                <p className="text-sm text-gray-500">Sembunyikan koordinat exact untuk privasi</p>
              </div>
              <Switch
                checked={settings.anonymizeLocationData}
                onCheckedChange={(checked) => handleSettingChange('anonymizeLocationData', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Fitur Lanjutan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Sinkronisasi Offline</Label>
                <p className="text-sm text-gray-500">Izinkan absen saat offline, sync otomatis saat online</p>
              </div>
              <Switch
                checked={settings.allowOfflineSync}
                onCheckedChange={(checked) => handleSettingChange('allowOfflineSync', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Autentikasi Biometrik</Label>
                <p className="text-sm text-gray-500">Gunakan fingerprint/face ID untuk absen</p>
              </div>
              <Switch
                checked={settings.enableBiometricAuth}
                onCheckedChange={(checked) => handleSettingChange('enableBiometricAuth', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Persetujuan Manager</Label>
                <p className="text-sm text-gray-500">Absensi luar area butuh persetujuan manager</p>
              </div>
              <Switch
                checked={settings.requireManagerApproval}
                onCheckedChange={(checked) => handleSettingChange('requireManagerApproval', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Hitung Lembur Otomatis</Label>
                <p className="text-sm text-gray-500">Otomatis hitung jam lembur berdasarkan check-out</p>
              </div>
              <Switch
                checked={settings.autoCalculateOvertime}
                onCheckedChange={(checked) => handleSettingChange('autoCalculateOvertime', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleSaveSettings} className="flex-1">
          Simpan Semua Pengaturan
        </Button>
        <Button variant="outline" onClick={resetToDefaults}>
          Reset ke Default
        </Button>
      </div>
    </div>
  );
};

export default AttendanceSettings;
