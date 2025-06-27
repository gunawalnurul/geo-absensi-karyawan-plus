
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import AttendanceSystem from '../components/AttendanceSystem';
import AttendanceManagement from './AttendanceManagement';
import LeaveManagement from '../components/LeaveManagement';
import PayrollSystem from '../components/PayrollSystem';
import EmployeeManagement from '../components/EmployeeManagement';
import ReportsSystem from '../components/ReportsSystem';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'attendance':
        return <AttendanceSystem />;
      case 'attendance-management':
        return <AttendanceManagement />;
      case 'leave':
        return <LeaveManagement />;
      case 'payroll':
        return <PayrollSystem />;
      case 'employees':
        return <EmployeeManagement />;
      case 'reports':
        return <ReportsSystem />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default Index;
