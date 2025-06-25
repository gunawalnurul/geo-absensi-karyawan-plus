
-- Pastikan enum app_role ada (skip jika sudah ada)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'employee');
    END IF;
END $$;

-- Pastikan function handle_new_user ada dengan implementasi yang benar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Pastikan trigger terpasang pada auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Pastikan RLS aktif untuk table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Buat ulang policies dengan nama unik untuk menghindari konflik
DROP POLICY IF EXISTS "Users can view own profile and admins view all" ON public.profiles;
CREATE POLICY "Users can view own profile and admins view all" 
  ON public.profiles 
  FOR SELECT 
  USING (
    id = auth.uid() OR 
    public.get_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "Users can update own profile and admins update all" ON public.profiles;
CREATE POLICY "Users can update own profile and admins update all" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    id = auth.uid() OR 
    public.get_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "Only admins can insert profiles" ON public.profiles;
CREATE POLICY "Only admins can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (public.get_user_role() = 'admin');

DROP POLICY IF EXISTS "Only admins can delete profiles" ON public.profiles;
CREATE POLICY "Only admins can delete profiles" 
  ON public.profiles 
  FOR DELETE 
  USING (public.get_user_role() = 'admin');
