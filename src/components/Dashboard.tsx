
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Users, Clock, TrendingUp, MapPin, FileText, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    lateToday: 0,
    pendingLeaves: 0
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [todaySummary, setTodaySummary] = useState({
    checkIn: null as string | null,
    checkOut: null as string | null,
    workingHours: 0
  });

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchAdminStats();
      fetchRecentActivities();
    } else {
      fetchEmployeeData();
      fetchEmployeeActivities();
    }
  }, [profile]);

  const fetchAdminStats = async () => {
    try {
      // Fetch total employees
      const { count: totalEmployees } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', today);

      // Fetch pending leave requests
      const { count: pendingLeaves } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const presentToday = attendance?.filter(a => a.check_in).length || 0;
      const lateToday = attendance?.filter(a => {
        if (!a.check_in) return false;
        const checkInTime = new Date(a.check_in);
        const lateThreshold = new Date(checkInTime);
        lateThreshold.setHours(9, 0, 0, 0); // 9 AM threshold
        return checkInTime > lateThreshold;
      }).length || 0;

      setStats({
        totalEmployees: totalEmployees || 0,
        presentToday,
        lateToday,
        pendingLeaves: pendingLeaves || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Fetch recent attendance
      const { data: attendance } = await supabase
        .from('attendance')
        .select(`
          *,
          profiles!inner(name)
        `)
        .eq('date', todayStr)
        .order('check_in', { ascending: false })
        .limit(10);

      // Fetch recent leave requests
      const { data: leaves } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const activities = [
        ...(attendance || []).map(a => ({
          time: a.check_in ? new Date(a.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--',
          activity: `${a.profiles?.name || 'Unknown'} melakukan check-in`,
          type: 'checkin'
        })),
        ...(leaves || []).map(l => ({
          time: new Date(l.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          activity: `Pengajuan cuti baru dari ${l.employee_name}`,
          type: 'leave'
        }))
      ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const fetchEmployeeData = async () => {
    if (!profile?.employee_id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', profile.employee_id)
        .eq('date', today)
        .single();

      if (attendance) {
        const checkIn = attendance.check_in ? new Date(attendance.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null;
        const checkOut = attendance.check_out ? new Date(attendance.check_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null;
        
        let workingHours = 0;
        if (attendance.check_in && attendance.check_out) {
          const start = new Date(attendance.check_in);
          const end = new Date(attendance.check_out);
          workingHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }

        setTodaySummary({
          checkIn,
          checkOut,
          workingHours: Math.round(workingHours * 10) / 10
        });
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  const fetchEmployeeActivities = async () => {
    if (!profile?.employee_id) return;

    try {
      // Fetch employee's recent attendance
      const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', profile.employee_id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch employee's recent leave requests
      const { data: leaves } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', profile.employee_id)
        .order('created_at', { ascending: false })
        .limit(3);

      const activities = [
        ...(attendance || []).map(a => ({
          time: a.check_in ? new Date(a.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--',
          activity: `Anda melakukan check-in${a.check_out ? ' dan check-out' : ''}`,
          type: 'checkin',
          date: new Date(a.date).toLocaleDateString('id-ID')
        })),
        ...(leaves || []).map(l => ({
          time: new Date(l.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          activity: `Anda mengajukan cuti ${l.type}`,
          type: 'leave',
          date: new Date(l.created_at).toLocaleDateString('id-ID')
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching employee activities:', error);
    }
  };

  const handleNavigate = (tab: string) => {
    // This would be implemented with proper navigation
    console.log(`Navigate to ${tab}`);
  };

  const adminStats = [
    {
      title: 'Total Karyawan',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      change: '+2.5%'
    },
    {
      title: 'Hadir Hari Ini',
      value: stats.presentToday,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+5.2%'
    },
    {
      title: 'Terlambat',
      value: stats.lateToday,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-1.2%'
    },
    {
      title: 'Cuti Tertunda',
      value: stats.pendingLeaves,
      icon: TrendingUp,
      color: 'bg-red-500',
      change: '+0.8%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Selamat Datang, {profile?.name}! 👋
        </h1>
        <p className="text-blue-100">
          {profile?.role === 'admin' 
            ? 'Kelola sistem absensi dan monitor aktivitas karyawan' 
            : 'Jangan lupa untuk melakukan absensi hari ini'}
        </p>
        <div className="mt-4 text-sm text-blue-100">
          <span className="font-medium">Role:</span> {profile?.role === 'admin' ? 'Administrator' : 'Karyawan'} |{' '}
          <span className="font-medium">ID:</span> {profile?.employee_id} |{' '}
          <span className="font-medium">Dept:</span> {profile?.department}
        </div>
      </div>

      {/* Admin Stats Cards */}
      {profile?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminStats.map((stat, index) => {
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
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 font-medium min-w-[50px]">
                      {activity.time}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.activity}</p>
                      {activity.date && (
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      )}
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
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Belum ada aktivitas hari ini
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions for Admin */}
        {profile?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex-col bg-blue-50 hover:bg-blue-100 border-blue-200"
                  onClick={() => handleNavigate('attendance-management')}
                >
                  <MapPin className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-blue-900">Kelola Lokasi</p>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex-col bg-green-50 hover:bg-green-100 border-green-200"
                  onClick={() => handleNavigate('employees')}
                >
                  <Users className="h-6 w-6 text-green-600 mb-2" />
                  <p className="text-sm font-medium text-green-900">Kelola Karyawan</p>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex-col bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
                  onClick={() => handleNavigate('leave')}
                >
                  <Calendar className="h-6 w-6 text-yellow-600 mb-2" />
                  <p className="text-sm font-medium text-yellow-900">Kelola Cuti</p>
                </Button>
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex-col bg-purple-50 hover:bg-purple-100 border-purple-200"
                  onClick={() => handleNavigate('reports')}
                >
                  <FileText className="h-6 w-6 text-purple-600 mb-2" />
                  <p className="text-sm font-medium text-purple-900">Lihat Laporan</p>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Today's Summary for Employee */}
      {profile?.role === 'employee' && (
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {todaySummary.checkIn || '--:--'}
                </div>
                <p className="text-sm text-green-800">Waktu Masuk</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {todaySummary.checkOut || '--:--'}
                </div>
                <p className="text-sm text-blue-800">Waktu Keluar</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {todaySummary.workingHours || 0}
                </div>
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
