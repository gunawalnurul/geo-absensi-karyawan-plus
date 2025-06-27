
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, LogIn } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LoginForm = () => {
  const { signIn, loading } = useAuth();
  const { toast } = useToast();
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

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
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <LogIn className="h-5 w-5" />
              Masuk ke Akun Anda
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
