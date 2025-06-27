
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WFHRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  start_date: string;
  end_date: string;
  destination: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  duration_days: number;
}

interface WFHApprovalDialogProps {
  request: WFHRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApproval: () => void;
}

const WFHApprovalDialog = ({ request, isOpen, onClose, onApproval }: WFHApprovalDialogProps) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    if (!request) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('out_of_town_requests')
        .update({
          status: 'approved',
          approved_date: new Date().toISOString().split('T')[0],
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Pengajuan work from home telah disetujui'
      });

      onApproval();
      onClose();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyetujui pengajuan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!request || !rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Alasan penolakan harus diisi',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('out_of_town_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Pengajuan work from home telah ditolak'
      });

      onApproval();
      onClose();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Gagal menolak pengajuan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!request) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive'
    } as const;

    const labels = {
      pending: 'Pending',
      approved: 'Disetujui',
      rejected: 'Ditolak'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Approval Work From Home</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{request.employee_name}</p>
                  <p className="text-sm text-gray-600">ID: {request.employee_id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Periode</p>
                  <p className="text-sm text-gray-600">
                    {new Date(request.start_date).toLocaleDateString('id-ID')} - {new Date(request.end_date).toLocaleDateString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500">{request.duration_days} hari</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Tujuan</p>
                  <p className="text-sm text-gray-600">{request.destination}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  {getStatusBadge(request.status)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium mb-2">Keperluan:</p>
            <p className="text-sm text-gray-700">{request.purpose}</p>
          </div>
          
          {request.status === 'pending' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Alasan Penolakan (opsional)</label>
                <Textarea
                  placeholder="Masukkan alasan jika menolak pengajuan..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          {request.status === 'pending' && (
            <>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={loading}
              >
                Tolak
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={loading}
              >
                Setujui
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WFHApprovalDialog;
