
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

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  joinDate: string;
  isOutOfTown: boolean;
  avatar?: string;
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
