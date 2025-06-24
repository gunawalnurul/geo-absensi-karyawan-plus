
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../context/AuthContext';
import { mockEmployees } from '../data/mockData';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Karyawan',
      value: mockEmployees.length,
      icon: Users,
      color: 'bg-blue-500',
      change: '+2.5%'
    },
    {
      title: 'Hadir Hari Ini',
      value: 18,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+5.2%'
    },
    {
      title: 'Terlambat',
      value: 2,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-1.2%'
    },
    {
      title: 'Cuti Tertunda',
      value: 3,
      icon: TrendingUp,
      color: 'bg-red-500',
      change: '+0.8%'
    }
  ];

  const recentActivities = [
    { time: '09:15', activity: 'Ahmad Wijaya melakukan check-in', type: 'checkin' },
    { time: '09:30', activity: 'Siti Nurhaliza melakukan check-in', type: 'checkin' },
    { time: '10:00', activity: 'Pengajuan cuti baru dari Budi Santoso', type: 'leave' },
    { time: '10:15', activity: 'Dewi Kusuma melakukan check-in', type: 'checkin' },
    { time: '10:30', activity: 'Slip gaji bulan ini telah digenerate', type: 'payroll' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Selamat Datang, {user?.name}! 👋
        </h1>
        <p className="text-blue-100">
          {user?.role === 'admin' 
            ? 'Kelola sistem absensi dan monitor aktivitas karyawan' 
            : 'Jangan lupa untuk melakukan absensi hari ini'}
        </p>
      </div>

      {/* Stats Cards */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change} dari bulan lalu
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-full`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 font-medium min-w-[50px]">
                    {activity.time}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.activity}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.type === 'checkin' ? 'bg-green-100 text-green-800' :
                    activity.type === 'leave' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {activity.type === 'checkin' ? 'Check-in' :
                     activity.type === 'leave' ? 'Cuti' : 'Payroll'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Calendar className="h-6 w-6 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-blue-900">Absensi Hari Ini</p>
              </button>
              <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Users className="h-6 w-6 text-green-600 mb-2" />
                <p className="text-sm font-medium text-green-900">Lihat Karyawan</p>
              </button>
              <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <Clock className="h-6 w-6 text-yellow-600 mb-2" />
                <p className="text-sm font-medium text-yellow-900">Pengajuan Cuti</p>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
                <p className="text-sm font-medium text-purple-900">Lihat Laporan</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Summary for Employee */}
      {user?.role === 'employee' && (
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">08:30</div>
                <p className="text-sm text-green-800">Waktu Masuk</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">--:--</div>
                <p className="text-sm text-blue-800">Waktu Keluar</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">7.5</div>
                <p className="text-sm text-yellow-800">Jam Kerja</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
