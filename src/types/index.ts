
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  employeeId?: string;
  department?: string;
  position?: string;
  salary?: number;
  isOutOfTown?: boolean;
  joinDate?: string;
  avatar?: string;
}

// Updated Employee interface to match database schema
export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  join_date: string;
  is_out_of_town: boolean;
  avatar?: string;
  role: 'admin' | 'employee';
  created_at?: string;
  updated_at?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'present' | 'late' | 'absent';
  isOutOfTownAccess?: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface PaySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  overtime: number;
  grossSalary: number;
  tax: number;
  socialSecurity: number;
  netSalary: number;
  workingDays: number;
  attendedDays: number;
}

export interface GeofenceLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // in meters
  isActive: boolean;
}
