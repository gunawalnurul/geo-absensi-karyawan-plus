
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'employee');
CREATE TYPE public.attendance_status AS ENUM ('present', 'late', 'absent');
CREATE TYPE public.leave_type AS ENUM ('annual', 'sick', 'personal', 'maternity');
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  salary INTEGER NOT NULL DEFAULT 0,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_out_of_town BOOLEAN DEFAULT FALSE,
  avatar TEXT,
  role app_role DEFAULT 'employee',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create geofence_locations table
CREATE TABLE public.geofence_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  radius INTEGER NOT NULL DEFAULT 100, -- in meters
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL REFERENCES public.profiles(employee_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_address TEXT,
  status attendance_status DEFAULT 'present',
  is_out_of_town_access BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Create leave_requests table
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL REFERENCES public.profiles(employee_id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status request_status DEFAULT 'pending',
  applied_date DATE DEFAULT CURRENT_DATE,
  approved_by UUID REFERENCES auth.users(id),
  approved_date DATE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create out_of_town_requests table
CREATE TABLE public.out_of_town_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL REFERENCES public.profiles(employee_id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  destination TEXT NOT NULL,
  purpose TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INTEGER NOT NULL,
  status request_status DEFAULT 'pending',
  applied_date DATE DEFAULT CURRENT_DATE,
  approved_by UUID REFERENCES auth.users(id),
  approved_date DATE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payroll table
CREATE TABLE public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL REFERENCES public.profiles(employee_id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  basic_salary INTEGER NOT NULL,
  allowances INTEGER DEFAULT 0,
  overtime INTEGER DEFAULT 0,
  gross_salary INTEGER NOT NULL,
  tax INTEGER DEFAULT 0,
  social_security INTEGER DEFAULT 0,
  net_salary INTEGER NOT NULL,
  working_days INTEGER DEFAULT 22,
  attended_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.out_of_town_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to get employee_id
CREATE OR REPLACE FUNCTION public.get_employee_id()
RETURNS TEXT AS $$
  SELECT employee_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile and admins view all" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR 
    public.get_user_role() = 'admin'
  );

CREATE POLICY "Users can update own profile and admins update all" ON public.profiles
  FOR UPDATE USING (
    id = auth.uid() OR 
    public.get_user_role() = 'admin'
  );

CREATE POLICY "Only admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Only admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.get_user_role() = 'admin');

-- RLS Policies for geofence_locations
CREATE POLICY "Anyone can view active locations" ON public.geofence_locations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can modify locations" ON public.geofence_locations
  FOR ALL USING (public.get_user_role() = 'admin');

-- RLS Policies for attendance
CREATE POLICY "Users can view own attendance and admins view all" ON public.attendance
  FOR SELECT USING (
    employee_id = public.get_employee_id() OR 
    public.get_user_role() = 'admin'
  );

CREATE POLICY "Users can insert own attendance" ON public.attendance
  FOR INSERT WITH CHECK (employee_id = public.get_employee_id());

CREATE POLICY "Users can update own attendance and admins update all" ON public.attendance
  FOR UPDATE USING (
    employee_id = public.get_employee_id() OR 
    public.get_user_role() = 'admin'
  );

-- RLS Policies for leave_requests
CREATE POLICY "Users can view own requests and admins view all" ON public.leave_requests
  FOR SELECT USING (
    employee_id = public.get_employee_id() OR 
    public.get_user_role() = 'admin'
  );

CREATE POLICY "Users can insert own requests" ON public.leave_requests
  FOR INSERT WITH CHECK (employee_id = public.get_employee_id());

CREATE POLICY "Only admins can update leave requests" ON public.leave_requests
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- RLS Policies for out_of_town_requests
CREATE POLICY "Users can view own OOT requests and admins view all" ON public.out_of_town_requests
  FOR SELECT USING (
    employee_id = public.get_employee_id() OR 
    public.get_user_role() = 'admin'
  );

CREATE POLICY "Users can insert own OOT requests" ON public.out_of_town_requests
  FOR INSERT WITH CHECK (employee_id = public.get_employee_id());

CREATE POLICY "Only admins can update OOT requests" ON public.out_of_town_requests
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- RLS Policies for payroll
CREATE POLICY "Users can view own payroll and admins view all" ON public.payroll
  FOR SELECT USING (
    employee_id = public.get_employee_id() OR 
    public.get_user_role() = 'admin'
  );

CREATE POLICY "Only admins can modify payroll" ON public.payroll
  FOR ALL USING (public.get_user_role() = 'admin');

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_geofence_locations_updated_at
  BEFORE UPDATE ON public.geofence_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_out_of_town_requests_updated_at
  BEFORE UPDATE ON public.out_of_town_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_payroll_updated_at
  BEFORE UPDATE ON public.payroll
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default geofence locations
INSERT INTO public.geofence_locations (name, lat, lng, radius, is_active) VALUES
  ('Kantor Pusat Jakarta', -6.200000, 106.816666, 200, true),
  ('Kantor Cabang Surabaya', -7.250445, 112.768845, 150, true),
  ('Kantor Cabang Bandung', -6.917464, 107.619123, 150, true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if user metadata contains required fields
  IF NEW.raw_user_meta_data ? 'employee_id' THEN
    INSERT INTO public.profiles (
      id, 
      employee_id, 
      name, 
      email, 
      department, 
      position, 
      salary,
      role
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'employee_id',
      COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'department', 'General'),
      COALESCE(NEW.raw_user_meta_data ->> 'position', 'Employee'),
      COALESCE((NEW.raw_user_meta_data ->> 'salary')::INTEGER, 5000000),
      COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'employee')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
