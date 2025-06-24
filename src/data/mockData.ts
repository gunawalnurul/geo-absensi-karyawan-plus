
import { Employee, Attendance, LeaveRequest, PaySlip, GeofenceLocation } from '../types';

export const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: 'Ahmad Wijaya',
    email: 'ahmad.wijaya@company.com',
    department: 'IT',
    position: 'Software Developer',
    salary: 8000000,
    joinDate: '2022-01-15',
    isOutOfTown: false,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    name: 'Siti Nurhaliza',
    email: 'siti.nurhaliza@company.com',
    department: 'HR',
    position: 'HR Manager',
    salary: 12000000,
    joinDate: '2021-03-10',
    isOutOfTown: false,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5e9?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    name: 'Budi Santoso',
    email: 'budi.santoso@company.com',
    department: 'Finance',
    position: 'Accountant',
    salary: 7000000,
    joinDate: '2022-06-01',
    isOutOfTown: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    name: 'Dewi Kusuma',
    email: 'dewi.kusuma@company.com',
    department: 'Marketing',
    position: 'Marketing Specialist',
    salary: 6500000,
    joinDate: '2023-01-20',
    isOutOfTown: false,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '5',
    employeeId: 'EMP005',
    name: 'Andi Pratama',
    email: 'andi.pratama@company.com',
    department: 'IT',
    position: 'System Analyst',
    salary: 9000000,
    joinDate: '2021-08-15',
    isOutOfTown: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '6',
    employeeId: 'EMP006',
    name: 'Maya Sari',
    email: 'maya.sari@company.com',
    department: 'Operations',
    position: 'Operations Manager',
    salary: 11000000,
    joinDate: '2020-12-01',
    isOutOfTown: false,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '7',
    employeeId: 'EMP007',
    name: 'Rudi Hermawan',
    email: 'rudi.hermawan@company.com',
    department: 'Sales',
    position: 'Sales Representative',
    salary: 5500000,
    joinDate: '2023-03-15',
    isOutOfTown: true,
    avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '8',
    employeeId: 'EMP008',
    name: 'Lina Permata',
    email: 'lina.permata@company.com',
    department: 'HR',
    position: 'HR Specialist',
    salary: 6000000,
    joinDate: '2022-09-10',
    isOutOfTown: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '9',
    employeeId: 'EMP009',
    name: 'Agus Setiawan',
    email: 'agus.setiawan@company.com',
    department: 'IT',
    position: 'Network Administrator',
    salary: 7500000,
    joinDate: '2021-11-20',
    isOutOfTown: false,
    avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '10',
    employeeId: 'EMP010',
    name: 'Rina Wati',
    email: 'rina.wati@company.com',
    department: 'Finance',
    position: 'Finance Manager',
    salary: 13000000,
    joinDate: '2020-05-15',
    isOutOfTown: false,
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '11',
    employeeId: 'EMP011',
    name: 'Dodi Kurniawan',
    email: 'dodi.kurniawan@company.com',
    department: 'Marketing',
    position: 'Digital Marketing',
    salary: 6800000,
    joinDate: '2022-11-01',
    isOutOfTown: true,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '12',
    employeeId: 'EMP012',
    name: 'Sari Indah',
    email: 'sari.indah@company.com',
    department: 'Operations',
    position: 'Quality Assurance',
    salary: 6200000,
    joinDate: '2023-02-28',
    isOutOfTown: false,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '13',
    employeeId: 'EMP013',
    name: 'Hendra Wijaya',
    email: 'hendra.wijaya@company.com',
    department: 'Sales',
    position: 'Sales Manager',
    salary: 10000000,
    joinDate: '2021-07-01',
    isOutOfTown: true,
    avatar: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '14',
    employeeId: 'EMP014',
    name: 'Fitri Ramadhani',
    email: 'fitri.ramadhani@company.com',
    department: 'IT',
    position: 'UI/UX Designer',
    salary: 7200000,
    joinDate: '2022-04-15',
    isOutOfTown: false,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '15',
    employeeId: 'EMP015',
    name: 'Bambang Sutrisno',
    email: 'bambang.sutrisno@company.com',
    department: 'Operations',
    position: 'Logistics Coordinator',
    salary: 5800000,
    joinDate: '2023-05-10',
    isOutOfTown: true,
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '16',
    employeeId: 'EMP016',
    name: 'Indira Sari',
    email: 'indira.sari@company.com',
    department: 'HR',
    position: 'Recruitment Specialist',
    salary: 6300000,
    joinDate: '2022-12-05',
    isOutOfTown: false,
    avatar: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '17',
    employeeId: 'EMP017',
    name: 'Rizki Pratama',
    email: 'rizki.pratama@company.com',
    department: 'Finance',
    position: 'Tax Specialist',
    salary: 7800000,
    joinDate: '2021-10-20',
    isOutOfTown: false,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '18',
    employeeId: 'EMP018',
    name: 'Nita Kurnia',
    email: 'nita.kurnia@company.com',
    department: 'Marketing',
    position: 'Content Creator',
    salary: 5900000,
    joinDate: '2023-01-08',
    isOutOfTown: true,
    avatar: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '19',
    employeeId: 'EMP019',
    name: 'Arief Budiman',
    email: 'arief.budiman@company.com',
    department: 'IT',
    position: 'DevOps Engineer',
    salary: 9500000,
    joinDate: '2021-02-14',
    isOutOfTown: false,
    avatar: 'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '20',
    employeeId: 'EMP020',
    name: 'Diah Permatasari',
    email: 'diah.permatasari@company.com',
    department: 'Sales',
    position: 'Business Development',
    salary: 8500000,
    joinDate: '2022-08-25',
    isOutOfTown: true,
    avatar: 'https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=100&h=100&fit=crop&crop=face'
  }
];

export const mockGeofenceLocations: GeofenceLocation[] = [
  {
    id: '1',
    name: 'Kantor Pusat Jakarta',
    lat: -6.2088,
    lng: 106.8456,
    radius: 100,
    isActive: true
  },
  {
    id: '2',
    name: 'Cabang Surabaya',
    lat: -7.2575,
    lng: 112.7521,
    radius: 150,
    isActive: true
  },
  {
    id: '3',
    name: 'Cabang Bandung',
    lat: -6.9175,
    lng: 107.6191,
    radius: 120,
    isActive: true
  }
];

// Mock users for login (admin and employees)
export const mockUsers = [
  {
    id: 'admin1',
    email: 'admin@company.com',
    password: 'admin123',
    name: 'Administrator',
    role: 'admin' as const
  },
  ...mockEmployees.map(emp => ({
    id: emp.id,
    email: emp.email,
    password: 'employee123',
    name: emp.name,
    role: 'employee' as const,
    employeeId: emp.employeeId,
    department: emp.department,
    position: emp.position,
    salary: emp.salary,
    isOutOfTown: emp.isOutOfTown
  }))
];
