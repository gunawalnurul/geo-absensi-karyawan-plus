
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { LeaveRequest } from '../types';
import { Plus, Calendar, Clock, Check, X } from 'lucide-react';

const LeaveManagement = () => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: 'Ahmad Wijaya',
      type: 'annual',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      days: 3,
      reason: 'Liburan keluarga',
      status: 'approved',
      appliedDate: '2024-01-10',
      approvedBy: 'admin',
      approvedDate: '2024-01-11'
    },
    {
      id: '2',
      employeeId: 'EMP003',
      employeeName: 'Budi Santoso',
      type: 'sick',
      startDate: '2024-01-20',
      endDate: '2024-01-22',
      days: 3,
      reason: 'Sakit demam',
      status: 'pending',
      appliedDate: '2024-01-19'
    },
    {
      id: '3',
      employeeId: 'EMP005',
      employeeName: 'Andi Pratama',
      type: 'personal',
      startDate: '2024-01-25',
      endDate: '2024-01-25',
      days: 1,
      reason: 'Urusan pribadi',
      status: 'rejected',
      appliedDate: '2024-01-20'
    }
  ]);

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

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmitLeave = () => {
    if (!newLeave.type || !newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      alert('Mohon lengkapi semua field');
      return;
    }

    const days = calculateDays(newLeave.startDate, newLeave.endDate);
    const request: LeaveRequest = {
      id: Date.now().toString(),
      employeeId: user?.employeeId || '',
      employeeName: user?.name || '',
      type: newLeave.type as any,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      days,
      reason: newLeave.reason,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    setLeaveRequests([request, ...leaveRequests]);
    setNewLeave({ type: '', startDate: '', endDate: '', reason: '' });
    setIsDialogOpen(false);
  };

  const handleApproveReject = (id: string, status: 'approved' | 'rejected') => {
    setLeaveRequests(prev => 
      prev.map(req => 
        req.id === id 
          ? { 
              ...req, 
              status, 
              approvedBy: user?.name || 'admin',
              approvedDate: new Date().toISOString().split('T')[0]
            }
          : req
      )
    );
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

  const filteredRequests = user?.role === 'admin' 
    ? leaveRequests 
    : leaveRequests.filter(req => req.employeeId === user?.employeeId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Cuti</h2>
          <p className="text-gray-600">Kelola pengajuan cuti karyawan</p>
        </div>
        
        {user?.role === 'employee' && (
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
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada pengajuan cuti
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{request.employeeName}</h4>
                      <p className="text-sm text-gray-600">{getTypeLabel(request.type)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(request.status)}
                      {user?.role === 'admin' && request.status === 'pending' && (
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
                      {new Date(request.startDate).toLocaleDateString('id-ID')} - {new Date(request.endDate).toLocaleDateString('id-ID')}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {request.days} hari
                    </div>
                    <div className="text-gray-600">
                      Diajukan: {new Date(request.appliedDate).toLocaleDateString('id-ID')}
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Alasan:</span> {request.reason}
                    </p>
                  </div>

                  {request.status !== 'pending' && (
                    <div className="mt-2 text-xs text-gray-500">
                      {request.status === 'approved' ? 'Disetujui' : 'Ditolak'} oleh {request.approvedBy} pada {new Date(request.approvedDate!).toLocaleDateString('id-ID')}
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
