import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock } from 'lucide-react';
import { AttendanceStatus } from '@/hooks/useAttendanceStatus';

interface AttendanceActionsCardProps {
  attendanceStatus: AttendanceStatus;
  canAttend: boolean;
  hasApprovedWFH: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export const AttendanceActionsCard: React.FC<AttendanceActionsCardProps> = ({
  attendanceStatus,
  canAttend,
  hasApprovedWFH,
  onCheckIn,
  onCheckOut
}) => {
  return (
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
                    onClick={onCheckIn}
                    disabled={!canAttend}
                    className={`mt-3 ${canAttend ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
                  >
                    {canAttend ? 'Check In Sekarang' : 'Tidak Dapat Check In'}
                  </Button>
                  <div className="mt-2 text-xs">
                    {hasApprovedWFH && (
                      <p className="text-green-600 font-medium">
                        ✅ WFH Disetujui - Dapat Check In
                      </p>
                    )}
                    {!canAttend && !hasApprovedWFH && (
                      <p className="text-gray-500">
                        Berada di luar area kantor dan tidak ada WFH aktif
                      </p>
                    )}
                  </div>
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
                    onClick={onCheckOut}
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
  );
};