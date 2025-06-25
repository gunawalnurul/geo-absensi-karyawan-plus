
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Employee = Tables<'profiles'>;
export type CreateEmployeeData = TablesInsert<'profiles'>;
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

      const { data, error: createError } = await supabase
        .from('profiles')
        .insert(employeeData)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      setEmployees(prev => [data, ...prev]);
      return { data, error: null };
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
