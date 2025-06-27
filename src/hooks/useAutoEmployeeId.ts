
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAutoEmployeeId = () => {
  const [nextEmployeeId, setNextEmployeeId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const generateNextEmployeeId = async () => {
    try {
      setLoading(true);
      
      // Fetch all existing employee IDs
      const { data: employees, error } = await supabase
        .from('profiles')
        .select('employee_id')
        .order('employee_id');

      if (error) throw error;

      if (!employees || employees.length === 0) {
        // If no employees exist, start with EMP001
        setNextEmployeeId('EMP001');
      } else {
        // Extract numeric parts and find the highest number
        const existingNumbers = employees
          .map(emp => {
            const match = emp.employee_id.match(/(\d+)$/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(num => num > 0);

        const nextNumber = existingNumbers.length > 0 
          ? Math.max(...existingNumbers) + 1 
          : 1;

        // Format with leading zeros (EMP001, EMP002, etc.)
        const formattedId = `EMP${nextNumber.toString().padStart(3, '0')}`;
        setNextEmployeeId(formattedId);
      }
    } catch (error) {
      console.error('Error generating employee ID:', error);
      // Fallback to a default format
      setNextEmployeeId(`EMP${Date.now().toString().slice(-3)}`);
    } finally {
      setLoading(false);
    }
  };

  const checkEmployeeIdExists = async (employeeId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('employee_id')
        .eq('employee_id', employeeId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking employee ID:', error);
      return false;
    }
  };

  useEffect(() => {
    generateNextEmployeeId();
  }, []);

  return {
    nextEmployeeId,
    loading,
    generateNextEmployeeId,
    checkEmployeeIdExists
  };
};
