
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import AttendanceSystem from '../components/AttendanceSystem';
import LeaveManagement from '../components/LeaveManagement';
import PayrollSystem from '../components/PayrollSystem';
import EmployeeManagement from '../components/EmployeeManagement';
import ReportsSystem from '../components/ReportsSystem';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'attendance':
        return <AttendanceSystem />;
      case 'leave':
        return <LeaveManagement />;
      case 'payroll':
        return <PayrollSystem />;
      case 'employees':
        return <EmployeeManagement />;
      case 'reports':
        return <ReportsSystem />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default Index;
