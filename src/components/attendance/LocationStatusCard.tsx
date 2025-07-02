import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, CheckCircle, XCircle, AlertCircle, Home, Clock } from 'lucide-react';
import WFHRequestForm from './WFHRequestForm';

interface LocationStatusCardProps {
  currentLocation: {lat: number, lng: number} | null;
  locationError: string;
  isWithinGeofence: boolean;
  hasApprovedWFH: boolean;
  nearestLocation: any;
  canAttend: boolean;
  onWFHSuccess: () => void;
  onRetryLocation: () => void;
}

export const LocationStatusCard: React.FC<LocationStatusCardProps> = ({
  currentLocation,
  locationError,
  isWithinGeofence,
  hasApprovedWFH,
  nearestLocation,
  canAttend,
  onWFHSuccess,
  onRetryLocation
}) => {
  const [showWFHForm, setShowWFHForm] = useState(false);

  const handleWFHSuccess = () => {
    onWFHSuccess();
    setShowWFHForm(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Status Lokasi
        </CardTitle>
      </CardHeader>
      <CardContent>
        {locationError ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
              <div className="flex items-start">
                <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium mb-1">🚫 Akses Lokasi Bermasalah</p>
                  <p className="text-red-700 text-sm leading-relaxed mb-3">{locationError}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onRetryLocation}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      🔄 Coba Lagi
                    </Button>
                    <Dialog open={showWFHForm} onOpenChange={setShowWFHForm}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          🏠 Ajukan WFH Sekarang
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
                  
                  <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs text-yellow-800 font-medium">💡 Tips Mengaktifkan Lokasi:</p>
                    <p className="text-xs text-yellow-700">
                      Klik ikon 🔒 atau 📍 di sebelah kiri URL browser → Pilih "Allow" untuk lokasi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {hasApprovedWFH && (
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <div>
                    <p className="text-green-800 font-bold text-lg">✅ Work From Home Disetujui</p>
                    <p className="text-green-700 font-medium">
                      Anda DAPAT melakukan absensi meskipun akses lokasi ditolak!
                    </p>
                    <p className="text-green-600 text-sm">
                      Klik tombol "Check In Sekarang" di bawah untuk melakukan absensi.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!hasApprovedWFH && (
              <div className="p-4 bg-yellow-50 rounded-lg">
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
                      Anda dapat melakukan absensi dari lokasi manapun karena permintaan WFH telah disetujui.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
      </CardContent>
    </Card>
  );
};