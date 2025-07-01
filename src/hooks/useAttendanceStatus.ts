import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface AttendanceStatus {
  checkedIn: boolean;
  checkedOut: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
}

export const useAttendanceStatus = () => {
  const { profile } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({
    checkedIn: false,
    checkedOut: false,
    checkInTime: null,
    checkOutTime: null
  });

  const checkTodayAttendance = async () => {
    if (!profile?.employee_id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
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

  useEffect(() => {
    checkTodayAttendance();
  }, [profile?.employee_id]);

  return {
    attendanceStatus,
    setAttendanceStatus,
    refreshAttendance: checkTodayAttendance
  };
};