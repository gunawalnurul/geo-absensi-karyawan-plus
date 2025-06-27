
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle, Home } from 'lucide-react';
import WFHRequestForm from './attendance/WFHRequestForm';

const AttendanceSystem = () => {
  const { profile } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isWithinGeofence, setIsWithinGeofence] = useState(false);
  const [hasApprovedWFH, setHasApprovedWFH] = useState(false);
  const [nearestLocation, setNearestLocation] = useState<any>(null);
  const [geofenceLocations, setGeofenceLocations] = useState<any[]>([]);
  const [showWFHForm, setShowWFHForm] = useState(false);
  const [canAttend, setCanAttend] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({
    checkedIn: false,
    checkedOut: false,
    checkInTime: null as string | null,
    checkOutTime: null as string | null
  });

  useEffect(() => {
    getCurrentLocation();
    fetchGeofenceLocations();
    checkTodayAttendance();
    checkApprovedWFHRequest();
  }, []);

  useEffect(() => {
    if (currentLocation && geofenceLocations.length > 0) {
      checkGeofenceStatus();
    }
  }, [currentLocation, geofenceLocations]);

  useEffect(() => {
    // Update attendance capability when WFH status or geofence status changes
    setCanAttend(isWithinGeofence || hasApprovedWFH);
  }, [isWithinGeofence, hasApprovedWFH]);

  const checkApprovedWFHRequest = async () => {
    if (!profile?.employee_id) return;

    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      console.log('Checking WFH request for date:', todayString);
      console.log('Employee ID:', profile.employee_id);
      
      const { data, error } = await supabase
        .from('out_of_town_requests')
        .select('*')
        .eq('employee_id', profile.employee_id)
        .eq('status', 'approved')
        .lte('start_date', todayString)
        .gte('end_date', todayString);

      if (error) {
        console.error('Error checking WFH request:', error);
        return;
      }

      console.log('WFH request data:', data);
      const hasApproved = data && data.length > 0;
      console.log('Has approved WFH:', hasApproved);
      
      setHasApprovedWFH(hasApproved);
    } catch (error) {
      console.error('Error checking WFH request:', error);
    }
  };

  const fetchGeofenceLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('geofence_locations')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching geofence locations:', error);
        return;
      }

      setGeofenceLocations(data || []);
    } catch (error) {
      console.error('Error fetching geofence locations:', error);
    }
  };

  const checkTodayAttendance = async () => {
    if (!profile?.employee_id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      // Use maybeSingle() instead of single() to avoid 406 error when no data exists
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', profile.employee_id)
        .eq('date', today)
        .maybeSingle();

      if (error) {
        console.error('Error checking today attendance:', error);
        return;
      }

      if (data) {
        setAttendanceStatus({
          checkedIn: !!data.check_in,
          checkedOut: !!data.check_out,
          checkInTime: data.check_in ? new Date(data.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null,
          checkOutTime: data.check_out ? new Date(data.check_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null
        });
      }
    } catch (error) {
      console.error('Error checking today attendance:', error);
    }
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError('');
          console.log('Location obtained successfully:', position.coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMessage = '';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Akses lokasi ditolak. Untuk dapat absensi, mohon izinkan akses lokasi di browser atau gunakan fitur Work From Home.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Informasi lokasi tidak tersedia. Pastikan GPS aktif.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Timeout dalam mengambil lokasi. Coba lagi.';
              break;
            default:
              errorMessage = 'Terjadi error dalam mengambil lokasi.';
              break;
          }
          
          setLocationError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setLocationError('Geolocation tidak didukung di browser ini.');
    }
  };

  const checkGeofenceStatus = () => {
    if (!currentLocation) return;

    let closestLocation = null;
    let minDistance = Infinity;
    let withinAnyGeofence = false;

    geofenceLocations.forEach(location => {
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        parseFloat(location.lat),
        parseFloat(location.lng)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestLocation = { ...location, distance };
      }

      if (distance <= location.radius) {
        withinAnyGeofence = true;
      }
    });

    setNearestLocation(closestLocation);
    setIsWithinGeofence(withinAnyGeofence);
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const handleCheckIn = async () => {
    console.log('Check-in attempt:', {
      isWithinGeofence,
      hasApprovedWFH,
      canAttend,
      currentLocation
    });

    if (!canAttend) {
      alert('Anda tidak dapat melakukan absensi. Pastikan berada dalam area kantor atau memiliki persetujuan Work From Home.');
      return;
    }

    if (!profile?.employee_id) {
      alert('Data karyawan tidak ditemukan.');
      return;
    }

    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('attendance')
        .upsert({
          employee_id: profile.employee_id,
          date: today,
          check_in: now.toISOString(),
          location_lat: currentLocation?.lat,
          location_lng: currentLocation?.lng,
          location_address: nearestLocation?.name || (hasApprovedWFH ? 'Work From Home' : 'Lokasi Remote'),
          is_out_of_town_access: hasApprovedWFH,
          status: 'present'
        });

      if (error) {
        console.error('Error checking in:', error);
        alert('Gagal melakukan check-in. Silakan coba lagi.');
        return;
      }

      const timeString = now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      setAttendanceStatus(prev => ({
        ...prev,
        checkedIn: true,
        checkInTime: timeString
      }));

      alert('Check-in berhasil!');
      console.log('Check-in berhasil:', {
        employeeId: profile.employee_id,
        time: timeString,
        location: currentLocation,
        address: nearestLocation?.name || (hasApprovedWFH ? 'Work From Home' : 'Lokasi Remote')
      });
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Gagal melakukan check-in. Silakan coba lagi.');
    }
  };

  const handleCheckOut = async () => {
    if (!attendanceStatus.checkedIn) {
      alert('Anda belum melakukan check-in hari ini.');
      return;
    }

    if (!profile?.employee_id) {
      alert('Data karyawan tidak ditemukan.');
      return;
    }

    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('attendance')
        .update({
          check_out: now.toISOString()
        })
        .eq('employee_id', profile.employee_id)
        .eq('date', today);

      if (error) {
        console.error('Error checking out:', error);
        alert('Gagal melakukan check-out. Silakan coba lagi.');
        return;
      }

      const timeString = now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      setAttendanceStatus(prev => ({
        ...prev,
        checkedOut: true,
        checkOutTime: timeString
      }));

      alert('Check-out berhasil!');
      console.log('Check-out berhasil:', {
        employeeId: profile.employee_id,
        time: timeString,
        location: currentLocation
      });
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Gagal melakukan check-out. Silakan coba lagi.');
    }
  };

  const handleWFHSuccess = () => {
    // Refresh the approved WFH status
    checkApprovedWFHRequest();
    setShowWFHForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Location Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Status Lokasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {locationError ? (
            <div className="flex items-center p-4 bg-red-50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500 mr-3" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error Lokasi</p>
                <p className="text-red-600 text-sm">{locationError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={getCurrentLocation}
                  className="mt-2"
                >
                  Coba Lagi
                </Button>
              </div>
            </div>
          ) : currentLocation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="text-green-800 font-medium">Lokasi Terdeteksi</p>
                    <p className="text-green-600 text-sm">
                      {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                <Badge variant={canAttend ? "default" : "destructive"}>
                  {canAttend ? 'Dapat Absensi' : 'Tidak Dapat Absensi'}
                </Badge>
              </div>

              {nearestLocation && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Lokasi Terdekat</h4>
                  <p className="text-blue-800">{nearestLocation.name}</p>
                  <p className="text-blue-600 text-sm">
                    Jarak: {Math.round(nearestLocation.distance)}m
                    {nearestLocation.distance <= nearestLocation.radius && (
                      <span className="ml-2 text-green-600 font-medium">✓ Dalam Area</span>
                    )}
                  </p>
                </div>
              )}

              {hasApprovedWFH && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-green-800 font-medium">Work From Home Disetujui</p>
                      <p className="text-green-600 text-sm">
                        Permintaan WFH Anda telah disetujui. Anda dapat melakukan absensi dari lokasi manapun.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* WFH Request Option - Only show if not within geofence and no approved WFH */}
              {!canAttend && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Home className="h-5 w-5 text-orange-500 mr-3" />
                      <div>
                        <p className="text-orange-800 font-medium">Berada di Luar Area Kantor</p>
                        <p className="text-orange-600 text-sm">
                          Ajukan permintaan Work From Home/Anywhere untuk dapat melakukan absensi
                        </p>
                      </div>
                    </div>
                    <Dialog open={showWFHForm} onOpenChange={setShowWFHForm}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Home className="h-4 w-4 mr-2" />
                          Ajukan WFH
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <WFHRequestForm 
                          onClose={() => setShowWFHForm(false)}
                          onSuccess={handleWFHSuccess}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-500 mr-3 animate-spin" />
              <p className="text-gray-600">Mengambil lokasi...</p>
            </div>
          )}

          {/* Alternative attendance option when location is denied */}
          {locationError && !hasApprovedWFH && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-yellow-800 font-medium">Akses Lokasi Ditolak</p>
                    <p className="text-yellow-600 text-sm">
                      Untuk dapat absensi tanpa akses lokasi, silakan ajukan Work From Home
                    </p>
                  </div>
                </div>
                <Dialog open={showWFHForm} onOpenChange={setShowWFHForm}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Home className="h-4 w-4 mr-2" />
                      Ajukan WFH
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <WFHRequestForm 
                      onClose={() => setShowWFHForm(false)}
                      onSuccess={handleWFHSuccess}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Absensi Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Check In */}
            <div className="space-y-4">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Check In</h3>
                {attendanceStatus.checkedIn ? (
                  <div>
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">{attendanceStatus.checkInTime}</p>
                    <p className="text-green-600 text-sm">Sudah Check In</p>
                  </div>
                ) : (
                  <div>
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Belum Check In</p>
                    <Button 
                      onClick={handleCheckIn}
                      disabled={!canAttend}
                      className="mt-3 bg-green-600 hover:bg-green-700"
                    >
                      Check In Sekarang
                    </Button>
                    {!canAttend && (
                      <p className="text-xs text-gray-500 mt-2">
                        {locationError ? 'Izinkan akses lokasi atau ajukan WFH' : 'Berada di luar area kantor'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Check Out */}
            <div className="space-y-4">
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">Check Out</h3>
                {attendanceStatus.checkedOut ? (
                  <div>
                    <CheckCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-800 font-medium">{attendanceStatus.checkOutTime}</p>
                    <p className="text-red-600 text-sm">Sudah Check Out</p>
                  </div>
                ) : (
                  <div>
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Belum Check Out</p>
                    <Button 
                      onClick={handleCheckOut}
                      disabled={!attendanceStatus.checkedIn}
                      variant="destructive"
                      className="mt-3"
                    >
                      Check Out Sekarang
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Today's Summary */}
          {attendanceStatus.checkedIn && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Ringkasan Hari Ini</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-blue-600">Waktu Masuk</p>
                  <p className="font-medium text-blue-900">{attendanceStatus.checkInTime}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Waktu Keluar</p>
                  <p className="font-medium text-blue-900">{attendanceStatus.checkOutTime || '--:--'}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Durasi Kerja</p>
                  <p className="font-medium text-blue-900">
                    {attendanceStatus.checkOutTime ? '8.5 jam' : 'Sedang Bekerja'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceSystem;
