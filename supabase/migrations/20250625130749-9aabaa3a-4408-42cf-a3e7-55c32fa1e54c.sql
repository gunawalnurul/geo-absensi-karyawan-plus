
-- Perbaiki RLS policy untuk INSERT profiles
-- Hapus policy lama yang terlalu restrictive
DROP POLICY IF EXISTS "Only admins can insert profiles" ON public.profiles;

-- Buat policy baru yang memungkinkan:
-- 1. User bisa insert profile mereka sendiri (untuk registrasi)
-- 2. Admin bisa insert profile siapa saja
CREATE POLICY "Users can insert own profile or admins can insert any" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (
    id = auth.uid() OR 
    public.get_user_role() = 'admin'
  );

-- Pastikan function handle_new_user berjalan dengan privileges yang tepat
-- dan tidak terpengaruh RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;
