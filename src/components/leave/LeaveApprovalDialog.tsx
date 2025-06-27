
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';

interface LeaveApprovalDialogProps {
  onApprove: (message?: string) => void;
  onReject: (message: string) => void;
  disabled?: boolean;
}

const LeaveApprovalDialog = ({ onApprove, onReject, disabled }: LeaveApprovalDialogProps) => {
  const [approvalMessage, setApprovalMessage] = useState('');
  const [rejectionMessage, setRejectionMessage] = useState('');
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [rejectionOpen, setRejectionOpen] = useState(false);

  const handleApprove = () => {
    onApprove(approvalMessage);
    setApprovalMessage('');
    setApprovalOpen(false);
  };

  const handleReject = () => {
    if (!rejectionMessage.trim()) {
      alert('Alasan penolakan harus diisi');
      return;
    }
    onReject(rejectionMessage);
    setRejectionMessage('');
    setRejectionOpen(false);
  };

  return (
    <div className="flex space-x-1">
      {/* Approve Dialog */}
      <Dialog open={approvalOpen} onOpenChange={setApprovalOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={disabled}
            className="text-green-600 hover:text-green-700"
          >
            <Check className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui Pengajuan Cuti</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approval-message">Pesan Persetujuan (Opsional)</Label>
              <Textarea
                id="approval-message"
                placeholder="Tambahkan catatan persetujuan..."
                value={approvalMessage}
                onChange={(e) => setApprovalMessage(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setApprovalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                Setujui
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectionOpen} onOpenChange={setRejectionOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            disabled={disabled}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Pengajuan Cuti</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-message">Alasan Penolakan *</Label>
              <Textarea
                id="rejection-message"
                placeholder="Jelaskan alasan penolakan..."
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
                className="mt-2"
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRejectionOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleReject} variant="destructive">
                Tolak
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveApprovalDialog;
