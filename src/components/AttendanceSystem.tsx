import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from '@/hooks/useLocation';
import { useWFHStatus } from '@/hooks/useWFHStatus';
import { useAttendanceStatus } from '@/hooks/useAttendanceStatus';
import { LocationStatusCard } from './attendance/LocationStatusCard';
import { AttendanceActionsCard } from './attendance/AttendanceActionsCard';

const AttendanceSystem = () => {
  const { profile } = useAuth();
  const { 
    currentLocation, 
    locationError, 
    isWithinGeofence, 
    nearestLocation,
    refreshLocation 
  } = useLocation();
  
  const { hasApprovedWFH, refreshWFHStatus } = useWFHStatus(locationError);
  const { attendanceStatus, setAttendanceStatus, refreshAttendance } = useAttendanceStatus();
  
  const [canAttend, setCanAttend] = useState(false);

  useEffect(() => {
    const newCanAttend = isWithinGeofence || hasApprovedWFH;
    console.log('🔄 Updating canAttend:', { 
      isWithinGeofence, 
      hasApprovedWFH, 
      newCanAttend,
      locationError: !!locationError,
      currentLocation: !!currentLocation
    });
    setCanAttend(newCanAttend);
  }, [isWithinGeofence, hasApprovedWFH]);

  const handleCheckIn = async () => {
    console.log('🔍 Check-in attempt with current state:', {
      isWithinGeofence,
      hasApprovedWFH,
      canAttend,
      currentLocation: !!currentLocation,
      locationError: !!locationError,
      employeeId: profile?.employee_id,
      attendanceStatus
    });

    if (!canAttend) {
      let message = 'Anda tidak dapat melakukan absensi. ';
      if (locationError && !hasApprovedWFH) {
        message += 'Pastikan berada dalam area kantor atau memiliki persetujuan Work From Home yang aktif.';
      } else if (!isWithinGeofence && !hasApprovedWFH) {
        message += 'Anda berada di luar area kantor dan tidak memiliki persetujuan Work From Home.';
      } else {
        message += 'Status belum memenuhi syarat untuk absensi.';
      }
      alert(message);
      return;
    }

    if (!profile?.employee_id) {
      alert('Data karyawan tidak ditemukan.');
      return;
    }

    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      let locationAddress = '';
      let lat = null;
      let lng = null;
      
      if (hasApprovedWFH) {
        locationAddress = 'Work From Home/Anywhere';
        lat = currentLocation?.lat || null;
        lng = currentLocation?.lng || null;
        console.log('✅ Using WFH mode for attendance');
      } else if (nearestLocation && isWithinGeofence) {
        locationAddress = nearestLocation.name;
        lat = currentLocation?.lat;
        lng = currentLocation?.lng;
        console.log('✅ Using office location for attendance');
      } else {
        locationAddress = 'Lokasi Remote';
        lat = currentLocation?.lat || null;
        lng = currentLocation?.lng || null;
      }
      
      console.log('💾 Saving attendance:', {
        employee_id: profile.employee_id,
        date: today,
        location_address: locationAddress,
        is_out_of_town_access: hasApprovedWFH,
        lat,
        lng
      });
      
      const { error } = await supabase
        .from('attendance')
        .upsert({
          employee_id: profile.employee_id,
          date: today,
          check_in: now.toISOString(),
          location_lat: lat,
          location_lng: lng,
          location_address: locationAddress,
          is_out_of_town_access: hasApprovedWFH,
          status: 'present'
        }, {
          onConflict: 'employee_id,date'
        });

      if (error) {
        console.error('❌ Error checking in:', error);
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
      console.log('✅ Check-in successful:', {
        employeeId: profile.employee_id,
        time: timeString,
        location: { lat, lng },
        address: locationAddress,
        wfhMode: hasApprovedWFH
      });
    } catch (error) {
      console.error('❌ Exception in handleCheckIn:', error);
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
      console.log('✅ Check-out successful:', {
        employeeId: profile.employee_id,
        time: timeString
      });
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Gagal melakukan check-out. Silakan coba lagi.');
    }
  };

  const handleWFHSuccess = () => {
    console.log('📝 WFH request submitted successfully, refreshing status...');
    setTimeout(() => {
      refreshWFHStatus();
    }, 1000);
  };

  // Debug render
  console.log('🖥️ AttendanceSystem render state:', {
    hasApprovedWFH,
    isWithinGeofence,
    canAttend,
    locationError: !!locationError,
    currentLocation: !!currentLocation,
    profile: profile?.employee_id
  });

  return (
    <div className="space-y-6">
      <LocationStatusCard
        currentLocation={currentLocation}
        locationError={locationError}
        isWithinGeofence={isWithinGeofence}
        hasApprovedWFH={hasApprovedWFH}
        nearestLocation={nearestLocation}
        canAttend={canAttend}
        onWFHSuccess={handleWFHSuccess}
        onRetryLocation={refreshLocation}
      />

      <AttendanceActionsCard
        attendanceStatus={attendanceStatus}
        canAttend={canAttend}
        hasApprovedWFH={hasApprovedWFH}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
      />
    </div>
  );
};

export default AttendanceSystem;
