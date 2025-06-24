
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockEmployees } from '../data/mockData';
import { Employee } from '../types';
import { Search, Plus, Edit, Trash2, MapPin, Calendar } from 'lucide-react';

const EmployeeManagement = () => {
  const [employees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const departments = Array.from(new Set(employees.map(emp => emp.department)));

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filterDepartment || employee.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Karyawan</h2>
          <p className="text-gray-600">Kelola data karyawan perusahaan</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Karyawan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{employees.length}</p>
              <p className="text-sm text-gray-600">Total Karyawan</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{departments.length}</p>
              <p className="text-sm text-gray-600">Departemen</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{employees.filter(e => e.isOutOfTown).length}</p>
              <p className="text-sm text-gray-600">Karyawan Luar Kota</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(employees.reduce((sum, emp) => sum + emp.salary, 0))}
              </p>
              <p className="text-sm text-gray-600">Total Gaji</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari karyawan (nama, ID, email)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Departemen</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback className="bg-blue-600 text-white text-lg">
                        {employee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                        {employee.isOutOfTown && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <MapPin className="h-3 w-3 mr-1" />
                            Luar Kota
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700">ID:</span>
                          <span className="ml-1">{employee.employeeId}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700">Email:</span>
                          <span className="ml-1">{employee.email}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700">Dept:</span>
                          <span className="ml-1">{employee.department}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700">Posisi:</span>
                          <span className="ml-1">{employee.position}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-700">Gaji</p>
                      <p className="text-lg font-bold text-green-800">{formatCurrency(employee.salary)}</p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-700">Tanggal Bergabung</p>
                      <p className="text-sm text-blue-800 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(employee.joinDate)}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-purple-700">Masa Kerja</p>
                      <p className="text-sm text-purple-800">
                        {Math.floor((new Date().getTime() - new Date(employee.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} tahun
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada karyawan yang ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;
