
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LeaveRequestForm from './leave/LeaveRequestForm';
import LeaveRequestsList from './leave/LeaveRequestsList';

const LeaveManagement = () => {
  const { profile } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveRequests();
  }, [profile]);

  const fetchLeaveRequests = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      
      let query = supabase.from('leave_requests').select('*');
      
      // If employee, only show their requests
      if (profile.role === 'employee') {
        query = query.eq('employee_id', profile.employee_id);
      }
      
      // Order by created_at descending
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leave requests:', error);
        return;
      }

      setLeaveRequests(data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status,
          approved_by: profile?.id,
          approved_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating leave request:', error);
        alert('Gagal mengupdate status. Silakan coba lagi.');
        return;
      }

      // Refresh the list
      await fetchLeaveRequests();
      
      alert(`Pengajuan cuti berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}!`);
    } catch (error) {
      console.error('Error updating leave request:', error);
      alert('Gagal mengupdate status. Silakan coba lagi.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Cuti</h2>
          <p className="text-gray-600">Kelola pengajuan cuti karyawan</p>
        </div>
        
        <LeaveRequestForm onLeaveSubmitted={fetchLeaveRequests} />
      </div>

      {/* Leave Requests List */}
      <LeaveRequestsList
        leaveRequests={leaveRequests}
        loading={loading}
        onApproveReject={handleApproveReject}
      />
    </div>
  );
};

export default LeaveManagement;
