
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Download, Filter, MapPin, User, Home, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import WFHApprovalDialog from './WFHApprovalDialog';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  status: 'present' | 'late' | 'absent';
  is_out_of_town_access: boolean;
  profiles: {
    name: string;
    department: string;
  };
}

interface OutOfTownRequest {
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

type AttendanceStatus = 'present' | 'late' | 'absent';

const AttendanceRecords = () => {
  const { profile } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [outOfTownRequests, setOutOfTownRequests] = useState<OutOfTownRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'attendance' | 'wfh'>('attendance');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    department: 'all',
    status: 'all',
    employee: ''
  });
  const [wfhFilters, setWfhFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    employee: ''
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedWFHRequest, setSelectedWFHRequest] = useState<OutOfTownRequest | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendanceRecords();
    fetchOutOfTownRequests();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('department')
        .order('department');

      if (error) throw error;

      const uniqueDepartments = [...new Set(data?.map(p => p.department) || [])];
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('attendance')
        .select(`
          *,
          profiles!inner(name, department)
        `)
        .order('date', { ascending: false })
        .order('check_in', { ascending: false });

      // Apply filters
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status as AttendanceStatus);
      }
      if (filters.department && filters.department !== 'all') {
        query = query.eq('profiles.department', filters.department);
      }
      if (filters.employee) {
        query = query.ilike('profiles.name', `%${filters.employee}%`);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data absensi',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOutOfTownRequests = async () => {
    try {
      let query = supabase
        .from('out_of_town_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply WFH filters
      if (wfhFilters.startDate) {
        query = query.gte('start_date', wfhFilters.startDate);
      }
      if (wfhFilters.endDate) {
        query = query.lte('end_date', wfhFilters.endDate);
      }
      if (wfhFilters.status && wfhFilters.status !== 'all') {
        query = query.eq('status', wfhFilters.status);
      }
      if (wfhFilters.employee) {
        query = query.ilike('employee_name', `%${wfhFilters.employee}%`);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setOutOfTownRequests(data || []);
    } catch (error) {
      console.error('Error fetching out of town requests:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data work from home',
        variant: 'destructive'
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleWfhFilterChange = (key: string, value: string) => {
    setWfhFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    if (activeTab === 'attendance') {
      fetchAttendanceRecords();
    } else {
      fetchOutOfTownRequests();
    }
  };

  const handleResetFilters = () => {
    if (activeTab === 'attendance') {
      setFilters({
        startDate: '',
        endDate: '',
        department: 'all',
        status: 'all',
        employee: ''
      });
      setTimeout(() => {
        fetchAttendanceRecords();
      }, 100);
    } else {
      setWfhFilters({
        startDate: '',
        endDate: '',
        status: 'all',
        employee: ''
      });
      setTimeout(() => {
        fetchOutOfTownRequests();
      }, 100);
    }
  };

  const exportToCSV = () => {
    if (activeTab === 'attendance') {
      const headers = [
        'Tanggal', 'Nama Karyawan', 'Departemen', 'Check In', 'Check Out', 
        'Status', 'Lokasi', 'Latitude', 'Longitude', 'Akses Luar Area'
      ];

      const csvData = records.map(record => [
        record.date,
        record.profiles.name,
        record.profiles.department,
        record.check_in ? new Date(record.check_in).toLocaleTimeString('id-ID') : '-',
        record.check_out ? new Date(record.check_out).toLocaleTimeString('id-ID') : '-',
        record.status,
        record.location_address || '-',
        record.location_lat || '-',
        record.location_lng || '-',
        record.is_out_of_town_access ? 'Ya' : 'Tidak'
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `data-absensi-${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = [
        'Nama Karyawan', 'ID Karyawan', 'Tanggal Mulai', 'Tanggal Selesai', 
        'Durasi (Hari)', 'Tujuan', 'Keperluan', 'Status'
      ];

      const csvData = outOfTownRequests.map(request => [
        request.employee_name,
        request.employee_id,
        request.start_date,
        request.end_date,
        request.duration_days,
        request.destination,
        request.purpose,
        request.status
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `data-work-from-home-${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      URL.revokeObjectURL(url);
    }

    toast({
      title: 'Berhasil',
      description: 'Data berhasil diekspor'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      present: 'default',
      late: 'destructive',
      absent: 'secondary',
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive'
    } as const;

    const labels = {
      present: 'Hadir',
      late: 'Terlambat',
      absent: 'Tidak Hadir',
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

  const renderFilters = () => {
    if (activeTab === 'attendance') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal Mulai</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal Akhir</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Departemen</label>
            <Select value={filters.department} onValueChange={(value) => handleFilterChange('department', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Departemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Departemen</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="present">Hadir</SelectItem>
                <SelectItem value="late">Terlambat</SelectItem>
                <SelectItem value="absent">Tidak Hadir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Karyawan</label>
            <Input
              placeholder="Cari nama..."
              value={filters.employee}
              onChange={(e) => handleFilterChange('employee', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium invisible">Action</label>
            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} size="sm">
                Filter
              </Button>
              <Button variant="outline" onClick={handleResetFilters} size="sm">
                Reset
              </Button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal Mulai</label>
            <Input
              type="date"
              value={wfhFilters.startDate}
              onChange={(e) => handleWfhFilterChange('startDate', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal Akhir</label>
            <Input
              type="date"
              value={wfhFilters.endDate}
              onChange={(e) => handleWfhFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={wfhFilters.status} onValueChange={(value) => handleWfhFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Karyawan</label>
            <Input
              placeholder="Cari nama..."
              value={wfhFilters.employee}
              onChange={(e) => handleWfhFilterChange('employee', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium invisible">Action</label>
            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} size="sm">
                Filter
              </Button>
              <Button variant="outline" onClick={handleResetFilters} size="sm">
                Reset
              </Button>
            </div>
          </div>
        </div>
      );
    }
  };

  const handleWFHApproval = (request: OutOfTownRequest) => {
    setSelectedWFHRequest(request);
    setShowApprovalDialog(true);
  };

  const handleApprovalComplete = () => {
    fetchOutOfTownRequests();
    setSelectedWFHRequest(null);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'attendance' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('attendance')}
          className="flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          Data Absensi
        </Button>
        <Button
          variant={activeTab === 'wfh' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('wfh')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Work From Home
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter Data {activeTab === 'attendance' ? 'Absensi' : 'Work From Home'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderFilters()}
        </CardContent>
      </Card>

      {/* Records */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              {activeTab === 'attendance' ? (
                <>
                  <Clock className="h-5 w-5 mr-2" />
                  Data Absensi ({records.length} record)
                </>
              ) : (
                <>
                  <Home className="h-5 w-5 mr-2" />
                  Work From Home ({outOfTownRequests.length} record)
                </>
              )}
            </CardTitle>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="space-y-4">
                {activeTab === 'attendance' ? (
                  <>
                    {records.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{record.profiles.name}</span>
                            </div>
                            <p className="text-sm text-gray-600">{record.profiles.department}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(record.date).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium">Check In</span>
                            </div>
                            <p className="text-sm">
                              {record.check_in 
                                ? new Date(record.check_in).toLocaleTimeString('id-ID', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })
                                : '-'
                              }
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-medium">Check Out</span>
                            </div>
                            <p className="text-sm">
                              {record.check_out 
                                ? new Date(record.check_out).toLocaleTimeString('id-ID', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })
                                : '-'
                              }
                            </p>
                          </div>

                          <div className="space-y-2">
                            {getStatusBadge(record.status)}
                            {record.is_out_of_town_access && (
                              <Badge variant="outline" className="text-xs">
                                Akses Luar Area
                              </Badge>
                            )}
                          </div>
                        </div>

                        {record.location_address && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium">{record.location_address}</p>
                                {record.location_lat && record.location_lng && (
                                  <p className="text-gray-600">
                                    {record.location_lat.toFixed(6)}, {record.location_lng.toFixed(6)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {records.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Tidak ada data absensi ditemukan
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {outOfTownRequests.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        Tidak ada data work from home ditemukan
                      </div>
                    ) : (
                      outOfTownRequests.map((request) => (
                        <div key={request.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{request.employee_name}</span>
                              </div>
                              <p className="text-sm text-gray-600">ID: {request.employee_id}</p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">Periode</span>
                              </div>
                              <p className="text-sm">
                                {new Date(request.start_date).toLocaleDateString('id-ID')} - {new Date(request.end_date).toLocaleDateString('id-ID')}
                              </p>
                              <p className="text-xs text-gray-500">{request.duration_days} hari</p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Tujuan</span>
                              </div>
                              <p className="text-sm">{request.destination}</p>
                              <p className="text-xs text-gray-500">{request.purpose}</p>
                            </div>

                            <div className="space-y-2">
                              {getStatusBadge(request.status)}
                              {profile?.role === 'admin' && request.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleWFHApproval(request)}
                                    className="flex items-center gap-1"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    Review
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WFH Approval Dialog */}
      <WFHApprovalDialog
        request={selectedWFHRequest}
        isOpen={showApprovalDialog}
        onClose={() => {
          setShowApprovalDialog(false);
          setSelectedWFHRequest(null);
        }}
        onApproval={handleApprovalComplete}
      />
    </div>
  );
};

export default AttendanceRecords;
