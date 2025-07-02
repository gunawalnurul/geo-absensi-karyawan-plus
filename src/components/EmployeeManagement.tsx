
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '../hooks/useEmployees';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit, Trash2, User, Users, Building, Banknote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EmployeeForm from './employee/EmployeeForm';
import EmployeeTable from './employee/EmployeeTable';

const EmployeeManagement = () => {
  const { profile } = useAuth();
  const { employees, loading, error, createEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Only allow admin access
  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Akses Terbatas</h2>
          <p className="text-gray-500">Hanya administrator yang dapat mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = async (employeeData: any) => {
    try {
      const result = await createEmployee(employeeData);
      if (result.data && !result.error) {
        setShowForm(false);
        // Show login credentials notification
        toast({
          title: 'Karyawan Berhasil Ditambahkan!',
          description: (
            <div className="space-y-2">
              <p>Karyawan <strong>{employeeData.name}</strong> telah berhasil didaftarkan.</p>
              <div className="bg-blue-50 p-2 rounded border">
                <p className="text-sm font-medium text-blue-700">Kredensial Login:</p>
                <p className="text-sm text-blue-600">Email: <span className="font-mono">{employeeData.email}</span></p>
                <p className="text-sm text-blue-600">Password: <span className="font-mono font-semibold">karyawan123</span></p>
              </div>
            </div>
          ),
          duration: 8000,
        });
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleUpdateEmployee = async (employeeData: any) => {
    try {
      await updateEmployee(editingEmployee.id, employeeData);
      setEditingEmployee(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleDeleteEmployee = async (employee: any) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
      try {
        await deleteEmployee(employee.id);
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const averageSalary = employees.length > 0 ? totalSalary / employees.length : 0;

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Karyawan</h2>
          <p className="text-gray-600">Kelola data karyawan dan informasi mereka</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Karyawan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Karyawan</p>
                <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Karyawan Aktif</p>
                <p className="text-3xl font-bold text-gray-900">{employees.filter(emp => emp.role === 'employee').length}</p>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departemen</p>
                <p className="text-3xl font-bold text-gray-900">
                  {new Set(employees.map(emp => emp.department)).size}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <Building className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gaji</p>
                <p className="text-3xl font-bold text-gray-900">
                  Rp {totalSalary.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-full">
                <Banknote className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari karyawan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {filteredEmployees.length} dari {employees.length} karyawan
              </Badge>
            </div>
          </div>

          <EmployeeTable
            employees={filteredEmployees}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
            canManage={true}
          />
        </CardContent>
      </Card>

      {/* Employee Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <EmployeeForm
              employee={editingEmployee}
              onSubmit={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
