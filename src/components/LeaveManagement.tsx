
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Calendar, Clock, Check, X } from 'lucide-react';

const LeaveManagement = () => {
  const { profile } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newLeave, setNewLeave] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const leaveTypes = [
    { value: 'annual', label: 'Cuti Tahunan' },
    { value: 'sick', label: 'Cuti Sakit' },
    { value: 'personal', label: 'Cuti Pribadi' },
    { value: 'maternity', label: 'Cuti Melahirkan' }
  ];

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

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmitLeave = async () => {
    if (!newLeave.type || !newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      alert('Mohon lengkapi semua field');
      return;
    }

    if (!profile?.employee_id || !profile?.name) {
      alert('Data profil tidak lengkap');
      return;
    }

    try {
      const days = calculateDays(newLeave.startDate, newLeave.endDate);
      
      const { error } = await supabase
        .from('leave_requests')
        .insert({
          employee_id: profile.employee_id,
          employee_name: profile.name,
          type: newLeave.type,
          start_date: newLeave.startDate,
          end_date: newLeave.endDate,
          days,
          reason: newLeave.reason,
          status: 'pending'
        });

      if (error) {
        console.error('Error submitting leave request:', error);
        alert('Gagal mengajukan cuti. Silakan coba lagi.');
        return;
      }

      // Refresh the list
      await fetchLeaveRequests();
      
      // Reset form
      setNewLeave({ type: '', startDate: '', endDate: '', reason: '' });
      setIsDialogOpen(false);
      
      alert('Pengajuan cuti berhasil disubmit!');
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Gagal mengajukan cuti. Silakan coba lagi.');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Disetujui</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Ditolak</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeObj = leaveTypes.find(t => t.value === type);
    return typeObj?.label || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Cuti</h2>
          <p className="text-gray-600">Kelola pengajuan cuti karyawan</p>
        </div>
        
        {profile?.role === 'employee' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Ajukan Cuti
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Ajukan Cuti Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Jenis Cuti</Label>
                  <Select value={newLeave.type} onValueChange={(value) => setNewLeave({...newLeave, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis cuti" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Tanggal Mulai</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newLeave.startDate}
                      onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Tanggal Selesai</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newLeave.endDate}
                      onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                    />
                  </div>
                </div>

                {newLeave.startDate && newLeave.endDate && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Durasi: {calculateDays(newLeave.startDate, newLeave.endDate)} hari
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="reason">Alasan</Label>
                  <Textarea
                    id="reason"
                    placeholder="Masukkan alasan pengajuan cuti..."
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleSubmitLeave} className="bg-blue-600 hover:bg-blue-700">
                    Ajukan Cuti
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengajuan Cuti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaveRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada pengajuan cuti
              </div>
            ) : (
              leaveRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{request.employee_name}</h4>
                      <p className="text-sm text-gray-600">{getTypeLabel(request.type)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(request.status)}
                      {profile?.role === 'admin' && request.status === 'pending' && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveReject(request.id, 'approved')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveReject(request.id, 'rejected')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(request.start_date).toLocaleDateString('id-ID')} - {new Date(request.end_date).toLocaleDateString('id-ID')}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {request.days} hari
                    </div>
                    <div className="text-gray-600">
                      Diajukan: {new Date(request.applied_date).toLocaleDateString('id-ID')}
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Alasan:</span> {request.reason}
                    </p>
                  </div>

                  {request.status !== 'pending' && request.approved_date && (
                    <div className="mt-2 text-xs text-gray-500">
                      {request.status === 'approved' ? 'Disetujui' : 'Ditolak'} pada {new Date(request.approved_date).toLocaleDateString('id-ID')}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveManagement;
