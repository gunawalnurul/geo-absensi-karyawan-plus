
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LoginForm = () => {
  const { signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    employee_id: '',
    name: '',
    department: 'IT',
    position: 'Developer',
    salary: 5000000,
    role: 'employee' as 'admin' | 'employee'
  });

  const [error, setError] = useState('');

  const departments = [
    'IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'
  ];

  const positions = [
    'Manager', 'Senior Developer', 'Developer', 'Analyst', 'Coordinator', 
    'Specialist', 'Executive', 'Assistant'
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginData.email || !loginData.password) {
      setError('Email dan password harus diisi');
      return;
    }

    console.log('Login attempt with:', loginData.email);
    const { error } = await signIn(loginData.email, loginData.password);

    if (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Gagal login. Periksa email dan password Anda.';
      setError(errorMessage);
      toast({
        title: 'Login Gagal',
        description: errorMessage,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Login Berhasil',
        description: 'Selamat datang di sistem absensi!'
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!registerData.email || !registerData.password || !registerData.name || !registerData.employee_id) {
      setError('Semua field yang wajib harus diisi');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    console.log('Register attempt with:', {
      email: registerData.email,
      employee_id: registerData.employee_id,
      name: registerData.name,
      department: registerData.department,
      position: registerData.position,
      role: registerData.role
    });

    const { error } = await signUp(registerData.email, registerData.password, {
      employee_id: registerData.employee_id,
      name: registerData.name,
      department: registerData.department,
      position: registerData.position,
      salary: registerData.salary,
      role: registerData.role
    });

    if (error) {
      console.error('Register error:', error);
      const errorMessage = error.message || 'Gagal mendaftar. Silakan coba lagi.';
      setError(errorMessage);
      toast({
        title: 'Registrasi Gagal',
        description: errorMessage,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Registrasi Berhasil',
        description: 'Akun berhasil dibuat. Silakan cek email untuk konfirmasi.'
      });
      // Reset form
      setRegisterData({
        email: '',
        password: '',
        confirmPassword: '',
        employee_id: '',
        name: '',
        department: 'IT',
        position: 'Developer',
        salary: 5000000,
        role: 'employee'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sistem Absensi</h1>
          <p className="text-gray-600 mt-2">Kelola absensi karyawan dengan mudah</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Masuk ke Akun Anda</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Masuk
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Daftar
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mt-4" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? 'Memproses...' : 'Masuk'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee_id">ID Karyawan *</Label>
                      <Input
                        id="employee_id"
                        placeholder="EMP001"
                        value={registerData.employee_id}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, employee_id: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap *</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={registerData.name}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg_email">Email *</Label>
                    <Input
                      id="reg_email"
                      type="email"
                      placeholder="john@company.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg_password">Password *</Label>
                      <Input
                        id="reg_password"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Konfirmasi Password *</Label>
                      <Input
                        id="confirm_password"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Departemen</Label>
                      <Select value={registerData.department} onValueChange={(value) => setRegisterData(prev => ({ ...prev, department: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih departemen" />
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
                      <Select value={registerData.position} onValueChange={(value) => setRegisterData(prev => ({ ...prev, position: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih posisi" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map(pos => (
                            <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary">Gaji (IDR)</Label>
                      <Input
                        id="salary"
                        type="number"
                        placeholder="5000000"
                        value={registerData.salary}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, salary: parseInt(e.target.value) || 0 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={registerData.role} onValueChange={(value: 'admin' | 'employee') => setRegisterData(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                    {loading ? 'Mendaftar...' : 'Daftar Akun'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Sistem Absensi. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
