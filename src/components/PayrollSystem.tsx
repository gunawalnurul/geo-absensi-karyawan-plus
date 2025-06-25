import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../context/AuthContext';
import { mockEmployees } from '../data/mockData';
import { PaySlip } from '../types';
import { Download, Eye, DollarSign, FileText } from 'lucide-react';

const PayrollSystem = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('12');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedEmployee, setSelectedEmployee] = useState('all');

  // Mock payslip data
  const generatePaySlips = (): PaySlip[] => {
    return mockEmployees.map(employee => {
      const basicSalary = employee.salary;
      const allowances = basicSalary * 0.1; // 10% tunjangan
      const overtime = Math.floor(Math.random() * 1000000); // Random overtime
      const grossSalary = basicSalary + allowances + overtime;
      
      // Perhitungan pajak sederhana
      let tax = 0;
      if (grossSalary > 4500000) {
        tax = grossSalary * 0.05; // 5% untuk gaji > 4.5jt
      }
      
      const socialSecurity = grossSalary * 0.04; // 4% BPJS
      const netSalary = grossSalary - tax - socialSecurity;
      
      return {
        id: employee.id,
        employeeId: employee.employeeId,
        employeeName: employee.name,
        month: selectedMonth,
        year: parseInt(selectedYear),
        basicSalary,
        allowances,
        overtime,
        grossSalary,
        tax,
        socialSecurity,
        netSalary,
        workingDays: 22,
        attendedDays: Math.floor(Math.random() * 3) + 20 // 20-22 hari
      };
    });
  };

  const paySlips = generatePaySlips();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredPaySlips = user?.role === 'admin' 
    ? (selectedEmployee !== 'all' ? paySlips.filter(p => p.employeeId === selectedEmployee) : paySlips)
    : paySlips.filter(p => p.employeeId === user?.employeeId);

  const downloadPaySlip = (paySlip: PaySlip) => {
    // Simulate PDF download
    const content = `
SLIP GAJI
${paySlip.employeeName} (${paySlip.employeeId})
Periode: ${months.find(m => m.value === paySlip.month)?.label} ${paySlip.year}

PENDAPATAN:
Gaji Pokok: ${formatCurrency(paySlip.basicSalary)}
Tunjangan: ${formatCurrency(paySlip.allowances)}
Lembur: ${formatCurrency(paySlip.overtime)}
Gaji Kotor: ${formatCurrency(paySlip.grossSalary)}

POTONGAN:
Pajak PPh21: ${formatCurrency(paySlip.tax)}
BPJS: ${formatCurrency(paySlip.socialSecurity)}

GAJI BERSIH: ${formatCurrency(paySlip.netSalary)}

Hari Kerja: ${paySlip.workingDays}
Hari Hadir: ${paySlip.attendedDays}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slip-gaji-${paySlip.employeeName}-${paySlip.month}-${paySlip.year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {user?.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Karyawan</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua karyawan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua karyawan</SelectItem>
                    {mockEmployees.map(emp => (
                      <SelectItem key={emp.employeeId} value={emp.employeeId}>
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
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Gaji Kotor</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(paySlips.reduce((sum, p) => sum + p.grossSalary, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
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
                <FileText className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total BPJS</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(paySlips.reduce((sum, p) => sum + p.socialSecurity, 0))}
                  </p>
                </div>
                <Badge className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Gaji Bersih</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(paySlips.reduce((sum, p) => sum + p.netSalary, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
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
            {filteredPaySlips.map((paySlip) => (
              <div key={paySlip.id} className="border rounded-lg p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{paySlip.employeeName}</h4>
                    <p className="text-sm text-gray-600">{paySlip.employeeId}</p>
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
                    <p className="text-lg font-bold text-green-800">{formatCurrency(paySlip.basicSalary)}</p>
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
                    <p className="text-lg font-bold text-purple-800">{formatCurrency(paySlip.netSalary)}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Hari Kerja:</span>
                      <span className="ml-2 text-gray-600">{paySlip.workingDays} hari</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Hari Hadir:</span>
                      <span className="ml-2 text-gray-600">{paySlip.attendedDays} hari</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Potongan:</span>
                      <span className="ml-2 text-gray-600">{formatCurrency(paySlip.tax + paySlip.socialSecurity)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollSystem;
