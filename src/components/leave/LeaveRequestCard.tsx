
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock } from 'lucide-react';
import LeaveApprovalDialog from './LeaveApprovalDialog';

const leaveTypes = [
  { value: 'annual', label: 'Cuti Tahunan' },
  { value: 'sick', label: 'Cuti Sakit' },
  { value: 'personal', label: 'Cuti Pribadi' },
  { value: 'maternity', label: 'Cuti Melahirkan' }
] as const;

interface LeaveRequest {
  id: string;
  employee_name: string;
  type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: string;
  applied_date: string;
  approved_date?: string;
  rejection_reason?: string;
}

interface LeaveRequestCardProps {
  request: LeaveRequest;
  onApproveReject: (id: string, status: 'approved' | 'rejected', message?: string) => void;
}

const LeaveRequestCard = ({ request, onApproveReject }: LeaveRequestCardProps) => {
  const { profile } = useAuth();

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

  const handleApprove = (message?: string) => {
    onApproveReject(request.id, 'approved', message);
  };

  const handleReject = (message: string) => {
    onApproveReject(request.id, 'rejected', message);
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{request.employee_name}</h4>
          <p className="text-sm text-gray-600">{getTypeLabel(request.type)}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(request.status)}
          {profile?.role === 'admin' && request.status === 'pending' && (
            <LeaveApprovalDialog
              onApprove={handleApprove}
              onReject={handleReject}
            />
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
          {request.rejection_reason && (
            <div className="mt-1 p-2 bg-red-50 rounded text-red-700">
              <span className="font-medium">Alasan penolakan:</span> {request.rejection_reason}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveRequestCard;
