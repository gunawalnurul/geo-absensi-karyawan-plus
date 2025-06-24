
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockEmployees } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, FileText, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

const ReportsSystem = () => {
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Mock data for reports
  const attendanceData = [
    { month: 'Jan', present: 85, late: 12, absent: 3 },
    { month: 'Feb', present: 88, late: 8, absent: 4 },
    { month: 'Mar', present: 92, late: 6, absent: 2 },
    { month: 'Apr', present: 87, late: 10, absent: 3 },
    { month: 'Mei', present: 90, late: 7, absent: 3 },
    { month: 'Jun', present: 89, late: 9, absent: 2 }
  ];

  const departmentData = [
    { name: 'IT', value: 6, color: '#3B82F6' },
    { name: 'HR', value: 3, color: '#10B981' },
    { name: 'Finance', value: 3, color: '#F59E0B' },
    { name: 'Marketing', value: 3, color: '#EF4444' },
    { name: 'Operations', value: 3, color: '#8B5CF6' },
    { name: 'Sales', value: 2, color: '#06B6D4' }
  ];

  const salaryData = [
    { department: 'IT', avgSalary: 8400000 },
    { department: 'HR', avgSalary: 7000000 },
    { department: 'Finance', avgSalary: 9600000 },
    { department: 'Marketing', avgSalary: 6400000 },
    { department: 'Operations', avgSalary: 6800000 },
    { department: 'Sales', avgSalary: 8000000 }
  ];

  const leaveData = [
    { month: 'Jan', annual: 15, sick: 8, personal: 5 },
    { month: 'Feb', annual: 12, sick: 10, personal: 3 },
    { month: 'Mar', annual: 18, sick: 6, personal: 7 },
    { month: 'Apr', annual: 14, sick: 9, personal: 4 },
    { month: 'Mei', annual: 16, sick: 7, personal: 6 },
    { month: 'Jun', annual: 13, sick: 11, personal: 5 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const reportTypes = [
    { value: 'attendance', label: 'Laporan Absensi' },
    { value: 'department', label: 'Laporan Departemen' },
    { value: 'salary', label: 'Laporan Gaji' },
    { value: 'leave', label: 'Laporan Cuti' }
  ];

  const periods = [
    { value: 'monthly', label: 'Bulanan' },
    { value: 'quarterly', label: 'Triwulan' },
    { value: 'yearly', label: 'Tahunan' }
  ];

  const renderReport = () => {
    switch (selectedReport) {
      case 'attendance':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tren Absensi Karyawan</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="present" fill="#10B981" name="Hadir" />
                    <Bar dataKey="late" fill="#F59E0B" name="Terlambat" />
                    <Bar dataKey="absent" fill="#EF4444" name="Tidak Hadir" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">89%</p>
                    <p className="text-sm text-gray-600">Tingkat Kehadiran</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">8.7%</p>
                    <p className="text-sm text-gray-600">Tingkat Keterlambatan</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">2.3%</p>
                    <p className="text-sm text-gray-600">Tingkat Absen</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'department':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Karyawan per Departemen</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detail Departemen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentData.map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dept.color }}></div>
                        <span className="font-medium">{dept.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{dept.value} orang</p>
                        <p className="text-sm text-gray-600">{((dept.value / 20) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'salary':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rata-rata Gaji per Departemen</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="avgSalary" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(mockEmployees.reduce((sum, emp) => sum + emp.salary, 0))}</p>
                    <p className="text-sm text-gray-600">Total Gaji Bulanan</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(mockEmployees.reduce((sum, emp) => sum + emp.salary, 0) / mockEmployees.length)}</p>
                    <p className="text-sm text-gray-600">Rata-rata Gaji</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'leave':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tren Penggunaan Cuti</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={leaveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="annual" stroke="#3B82F6" name="Cuti Tahunan" />
                    <Line type="monotone" dataKey="sick" stroke="#EF4444" name="Cuti Sakit" />
                    <Line type="monotone" dataKey="personal" stroke="#10B981" name="Cuti Pribadi" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">98</p>
                    <p className="text-sm text-gray-600">Total Cuti Tahunan</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-600">51</p>
                    <p className="text-sm text-gray-600">Total Cuti Sakit</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">30</p>
                    <p className="text-sm text-gray-600">Total Cuti Pribadi</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sistem Laporan</h2>
          <p className="text-gray-600">Analisis dan laporan komprehensif</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Export Laporan
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Laporan</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Periode</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <FileText className="h-4 w-4 mr-2" />
                Generate Laporan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {renderReport()}
    </div>
  );
};

export default ReportsSystem;
