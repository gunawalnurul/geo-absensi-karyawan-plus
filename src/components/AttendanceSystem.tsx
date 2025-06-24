
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { mockGeofenceLocations } from '../data/mockData';
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const AttendanceSystem = () => {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isWithinGeofence, setIsWithinGeofence] = useState(false);
  const [nearestLocation, setNearestLocation] = useState<any>(null);
  const [attendanceStatus, setAttendanceStatus] = useState({
    checkedIn: false,
    checkedOut: false,
    checkInTime: null as string | null,
    checkOutTime: null as string | null
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      checkGeofenceStatus();
    }
  }, [currentLocation]);

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError('');
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Tidak dapat mengakses lokasi. Pastikan GPS aktif dan izin lokasi diberikan.');
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

    mockGeofenceLocations.forEach(location => {
      if (!location.isActive) return;

      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        location.lat,
        location.lng
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
    setIsWithinGeofence(withinAnyGeofence || user?.isOutOfTown || false);
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

  const handleCheckIn = () => {
    if (!isWithinGeofence && !user?.isOutOfTown) {
      alert('Anda berada di luar area kantor. Silakan mendekat ke kantor untuk melakukan absensi.');
      return;
    }

    const now = new Date().toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    setAttendanceStatus(prev => ({
      ...prev,
      checkedIn: true,
      checkInTime: now
    }));

    console.log('Check-in berhasil:', {
      employeeId: user?.employeeId,
      time: now,
      location: currentLocation,
      address: nearestLocation?.name || 'Lokasi Remote'
    });
  };

  const handleCheckOut = () => {
    if (!attendanceStatus.checkedIn) {
      alert('Anda belum melakukan check-in hari ini.');
      return;
    }

    const now = new Date().toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    setAttendanceStatus(prev => ({
      ...prev,
      checkedOut: true,
      checkOutTime: now
    }));

    console.log('Check-out berhasil:', {
      employeeId: user?.employeeId,
      time: now,
      location: currentLocation
    });
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
              <div>
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
                <Badge variant={isWithinGeofence ? "default" : "destructive"}>
                  {isWithinGeofence ? 'Dalam Area' : 'Luar Area'}
                </Badge>
              </div>

              {nearestLocation && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Lokasi Terdekat</h4>
                  <p className="text-blue-800">{nearestLocation.name}</p>
                  <p className="text-blue-600 text-sm">
                    Jarak: {Math.round(nearestLocation.distance)}m
                  </p>
                </div>
              )}

              {user?.isOutOfTown && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <p className="text-yellow-800 font-medium">Akses Luar Kota</p>
                      <p className="text-yellow-600 text-sm">
                        Anda memiliki izin untuk absensi dari luar area kantor.
                      </p>
                    </div>
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
                      disabled={!currentLocation || (!isWithinGeofence && !user?.isOutOfTown)}
                      className="mt-3 bg-green-600 hover:bg-green-700"
                    >
                      Check In Sekarang
                    </Button>
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
