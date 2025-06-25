import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Employee = Tables<'profiles'>;
export type CreateEmployeeData = Omit<TablesInsert<'profiles'>, 'id' | 'created_at' | 'updated_at'>;
export type UpdateEmployeeData = Partial<TablesUpdate<'profiles'>>;

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData: CreateEmployeeData) => {
    try {
      setError(null);

      // Only admin can create employees
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can create employees');
      }

      console.log('Creating employee with data:', employeeData);

      // First, create a user in Supabase Auth with the employee data in metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: employeeData.email,
        password: 'TempPassword123!', // Temporary password - should be changed on first login
        options: {
          data: {
            employee_id: employeeData.employee_id,
            name: employeeData.name,
            department: employeeData.department,
            position: employeeData.position,
            salary: employeeData.salary,
            role: employeeData.role || 'employee'
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Failed to create user account: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // The profile should be automatically created by the handle_new_user trigger
      // Let's wait a moment and then fetch the created profile
      setTimeout(async () => {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
        } else if (profileData) {
          setEmployees(prev => [profileData, ...prev]);
        }
      }, 1000);

      return { data: authData.user, error: null };
    } catch (err) {
      console.error('Error creating employee:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create employee';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const updateEmployee = async (id: string, updateData: UpdateEmployeeData) => {
    try {
      setError(null);

      // Only admin can update employees
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can update employees');
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setEmployees(prev => 
        prev.map(emp => emp.id === id ? data : emp)
      );
      return { data, error: null };
    } catch (err) {
      console.error('Error updating employee:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update employee';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      setError(null);

      // Only admin can delete employees
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can delete employees');
      }

      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setEmployees(prev => prev.filter(emp => emp.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting employee:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete employee';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees
  };
};
