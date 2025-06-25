
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Download, Filter, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const AttendanceRecords = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    department: '',
    status: '',
    employee: ''
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendanceRecords();
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
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.department) {
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchAttendanceRecords();
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      department: '',
      status: '',
      employee: ''
    });
    setTimeout(() => {
      fetchAttendanceRecords();
    }, 100);
  };

  const exportToCSV = () => {
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

    toast({
      title: 'Berhasil',
      description: 'Data absensi berhasil diekspor'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      present: 'default',
      late: 'destructive',
      absent: 'secondary'
    } as const;

    const labels = {
      present: 'Hadir',
      late: 'Terlambat',
      absent: 'Tidak Hadir'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter Data Absensi
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  <SelectItem value="">Semua Departemen</SelectItem>
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
                  <SelectItem value="">Semua Status</SelectItem>
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
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Data Absensi ({records.length} record)
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceRecords;
