
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Clock, 
  Calendar, 
  DollarSign, 
  Users, 
  BarChart3, 
  LogOut,
  Building2,
  MapPin
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout = ({ children, activeTab, onTabChange }: LayoutProps) => {
  const { profile, signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'employee'] },
    { id: 'attendance', label: 'Absensi', icon: Clock, roles: ['admin', 'employee'] },
    { id: 'attendance-management', label: 'Kelola Absensi', icon: MapPin, roles: ['admin'] },
    { id: 'leave', label: 'Cuti', icon: Calendar, roles: ['admin', 'employee'] },
    { id: 'payroll', label: 'Payroll', icon: DollarSign, roles: ['admin', 'employee'] },
    { id: 'employees', label: 'Karyawan', icon: Users, roles: ['admin'] },
    { id: 'reports', label: 'Laporan', icon: BarChart3, roles: ['admin'] }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(profile?.role || 'employee')
  );

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Sistem Absensi</h1>
                  <p className="text-xs text-gray-500">PT. Teknologi Maju</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.name}</p>
                <p className="text-xs text-gray-500">
                  {profile?.role === 'admin' ? 'Administrator' : 'Karyawan'} • {profile?.employee_id}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <div className="space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
