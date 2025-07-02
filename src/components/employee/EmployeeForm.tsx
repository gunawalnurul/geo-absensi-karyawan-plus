
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAutoEmployeeId } from '../../hooks/useAutoEmployeeId';

interface Employee {
  id?: string;
  employee_id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  role: 'admin' | 'employee';
  join_date: string;
}

interface EmployeeFormProps {
  employee?: Employee | null;
  onSubmit: (employee: Omit<Employee, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const EmployeeForm = ({ employee, onSubmit, onCancel }: EmployeeFormProps) => {
  const { nextEmployeeId, loading: idLoading, generateNextEmployeeId, checkEmployeeIdExists } = useAutoEmployeeId();
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    employee_id: '',
    name: '',
    email: '',
    department: '',
    position: '',
    salary: 5000000,
    role: 'employee',
    join_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [employeeIdError, setEmployeeIdError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (employee) {
      setFormData({
        employee_id: employee.employee_id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        salary: employee.salary,
        role: employee.role,
        join_date: employee.join_date
      });
    } else if (nextEmployeeId && !employee) {
      // Auto-fill employee_id for new employee
      setFormData(prev => ({
        ...prev,
        employee_id: nextEmployeeId
      }));
    }
  }, [employee, nextEmployeeId]);

  const handleEmployeeIdChange = async (value: string) => {
    setFormData(prev => ({ ...prev, employee_id: value }));
    setEmployeeIdError('');

    // Check if employee ID already exists (for new employees only)
    if (!employee && value.trim()) {
      const exists = await checkEmployeeIdExists(value.trim());
      if (exists) {
        setEmployeeIdError('Employee ID sudah digunakan');
      }
    }
  };

  const handleRefreshEmployeeId = async () => {
    if (!employee) {
      await generateNextEmployeeId();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (employeeIdError) {
      toast({
        title: 'Error',
        description: 'Perbaiki error pada form sebelum submit',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan data karyawan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'General'
  ];

  const positions = [
    'Manager', 'Senior Developer', 'Developer', 'Junior Developer', 
    'HR Specialist', 'Accountant', 'Marketing Specialist', 'Admin'
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {employee ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee ID</Label>
              <div className="flex gap-2">
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => handleEmployeeIdChange(e.target.value)}
                  placeholder="EMP001"
                  required
                  className={employeeIdError ? 'border-red-500' : ''}
                  disabled={idLoading}
                />
                {!employee && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshEmployeeId}
                    disabled={idLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${idLoading ? 'animate-spin' : ''}`} />
                  </Button>
                )}
              </div>
              {employeeIdError && (
                <p className="text-sm text-red-500">{employeeIdError}</p>
              )}
              {!employee && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">
                    ID akan dibuat otomatis berdasarkan urutan terakhir
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-xs text-blue-700 font-medium">
                      ℹ️ Informasi Login Default
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Password default: <span className="font-mono font-semibold">karyawan123</span>
                    </p>
                    <p className="text-xs text-blue-600">
                      Karyawan dapat login menggunakan email dan password default ini
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departemen</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Departemen" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Posisi</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Posisi" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(pos => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Gaji</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: parseInt(e.target.value) || 0 }))}
                placeholder="5000000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'employee') => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="join_date">Tanggal Bergabung</Label>
              <Input
                id="join_date"
                type="date"
                value={formData.join_date}
                onChange={(e) => setFormData(prev => ({ ...prev, join_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit" disabled={loading || !!employeeIdError}>
              {loading ? 'Menyimpan...' : employee ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployeeForm;
