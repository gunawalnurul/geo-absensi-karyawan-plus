
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Download, Eye, FileText } from 'lucide-react';

const PayrollSystem = () => {
  const { profile } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('12');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [paySlips, setPaySlips] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  useEffect(() => {
    fetchEmployees();
    fetchPaySlips();
  }, [profile]);

  useEffect(() => {
    fetchPaySlips();
  }, [selectedMonth, selectedYear, selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('employee_id, name')
        .order('name');

      if (error) {
        console.error('Error fetching employees:', error);
        return;
      }

      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchPaySlips = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('payroll')
        .select('*')
        .eq('month', parseInt(selectedMonth))
        .eq('year', parseInt(selectedYear));
      
      // If employee, only show their payslip
      if (profile.role === 'employee') {
        query = query.eq('employee_id', profile.employee_id);
      } else if (profile.role === 'admin' && selectedEmployee !== 'all') {
        query = query.eq('employee_id', selectedEmployee);
      }
      
      query = query.order('employee_name');

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching payslips:', error);
        return;
      }

      setPaySlips(data || []);
    } catch (error) {
      console.error('Error fetching payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const downloadPaySlip = (paySlip: any) => {
    // Simulate PDF download
    const content = `
SLIP GAJI
${paySlip.employee_name} (${paySlip.employee_id})
Periode: ${months.find(m => m.value === paySlip.month.toString())?.label} ${paySlip.year}

PENDAPATAN:
Gaji Pokok: ${formatCurrency(paySlip.basic_salary)}
Tunjangan: ${formatCurrency(paySlip.allowances)}
Lembur: ${formatCurrency(paySlip.overtime)}
Gaji Kotor: ${formatCurrency(paySlip.gross_salary)}

POTONGAN:
Pajak PPh21: ${formatCurrency(paySlip.tax)}
BPJS: ${formatCurrency(paySlip.social_security)}

GAJI BERSIH: ${formatCurrency(paySlip.net_salary)}

Hari Kerja: ${paySlip.working_days}
Hari Hadir: ${paySlip.attended_days}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slip-gaji-${paySlip.employee_name}-${paySlip.month}-${paySlip.year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <h2 className="text-2xl font-bold text-gray-900">Sistem Payroll</h2>
          <p className="text-gray-600">Kelola slip gaji karyawan</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {profile?.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Karyawan</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua karyawan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua karyawan</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.employee_id} value={emp.employee_id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <FileText className="h-4 w-4 mr-2" />
                Generate Slip
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Summary */}
      {profile?.role === 'admin' && paySlips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Gaji Kotor</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(paySlips.reduce((sum, p) => sum + p.gross_salary, 0))}
                  </p>
                </div>
                <div className="text-green-500 text-2xl font-bold">Rp</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pajak</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(paySlips.reduce((sum, p) => sum + p.tax, 0))}
                  </p>
                </div>
                <div className="text-red-500 text-2xl font-bold">Rp</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total BPJS</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(paySlips.reduce((sum, p) => sum + p.social_security, 0))}
                  </p>
                </div>
                <div className="text-blue-500 text-2xl font-bold">Rp</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Gaji Bersih</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(paySlips.reduce((sum, p) => sum + p.net_salary, 0))}
                  </p>
                </div>
                <div className="text-green-600 text-2xl font-bold">Rp</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payslips List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Slip Gaji - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paySlips.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada data slip gaji untuk periode ini
              </div>
            ) : (
              paySlips.map((paySlip) => (
                <div key={paySlip.id} className="border rounded-lg p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{paySlip.employee_name}</h4>
                      <p className="text-sm text-gray-600">{paySlip.employee_id}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Lihat
                      </Button>
                      <Button size="sm" onClick={() => downloadPaySlip(paySlip)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Gaji Pokok</p>
                      <p className="text-lg font-bold text-green-800">{formatCurrency(paySlip.basic_salary)}</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Tunjangan</p>
                      <p className="text-lg font-bold text-blue-800">{formatCurrency(paySlip.allowances)}</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-yellow-600 font-medium">Lembur</p>
                      <p className="text-lg font-bold text-yellow-800">{formatCurrency(paySlip.overtime)}</p>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Gaji Bersih</p>
                      <p className="text-lg font-bold text-purple-800">{formatCurrency(paySlip.net_salary)}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Hari Kerja:</span>
                        <span className="ml-2 text-gray-600">{paySlip.working_days} hari</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Hari Hadir:</span>
                        <span className="ml-2 text-gray-600">{paySlip.attended_days} hari</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Potongan:</span>
                        <span className="ml-2 text-gray-600">{formatCurrency(paySlip.tax + paySlip.social_security)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollSystem;
