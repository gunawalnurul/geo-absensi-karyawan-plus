
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

const leaveTypes = [
  { value: 'annual', label: 'Cuti Tahunan' },
  { value: 'sick', label: 'Cuti Sakit' },
  { value: 'personal', label: 'Cuti Pribadi' },
  { value: 'maternity', label: 'Cuti Melahirkan' }
] as const;

interface LeaveRequestFormProps {
  onLeaveSubmitted: () => void;
}

const LeaveRequestForm = ({ onLeaveSubmitted }: LeaveRequestFormProps) => {
  const { profile } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

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
          type: newLeave.type as 'annual' | 'sick' | 'personal' | 'maternity',
          start_date: newLeave.startDate,
          end_date: newLeave.endDate,
          days,
          reason: newLeave.reason,
          status: 'pending' as const
        });

      if (error) {
        console.error('Error submitting leave request:', error);
        alert('Gagal mengajukan cuti. Silakan coba lagi.');
        return;
      }

      // Reset form and close dialog
      setNewLeave({ type: '', startDate: '', endDate: '', reason: '' });
      setIsDialogOpen(false);
      onLeaveSubmitted();
      
      alert('Pengajuan cuti berhasil disubmit!');
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Gagal mengajukan cuti. Silakan coba lagi.');
    }
  };

  if (profile?.role !== 'employee') {
    return null;
  }

  return (
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
  );
};

export default LeaveRequestForm;
