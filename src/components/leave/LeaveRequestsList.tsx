
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LeaveRequestCard from './LeaveRequestCard';

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
}

interface LeaveRequestsListProps {
  leaveRequests: LeaveRequest[];
  loading: boolean;
  onApproveReject: (id: string, status: 'approved' | 'rejected') => void;
}

const LeaveRequestsList = ({ leaveRequests, loading, onApproveReject }: LeaveRequestsListProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengajuan Cuti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
              <LeaveRequestCard
                key={request.id}
                request={request}
                onApproveReject={onApproveReject}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestsList;
