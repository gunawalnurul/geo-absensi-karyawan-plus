import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useWFHStatus = (locationError: string) => {
  const { profile } = useAuth();
  const [hasApprovedWFH, setHasApprovedWFH] = useState(false);

  const checkApprovedWFHRequest = async () => {
    if (!profile?.employee_id) {
      console.log('❌ No employee_id found in profile:', profile);
      return;
    }

    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      console.log('🔍 Checking WFH request for:', {
        employee_id: profile.employee_id,
        date: todayString,
        profile: profile
      });
      
      // First try exact date match
      let { data, error } = await supabase
        .from('out_of_town_requests')
        .select('*')
        .eq('employee_id', profile.employee_id)
        .eq('status', 'approved')
        .lte('start_date', todayString)
        .gte('end_date', todayString);

      // If no exact match and location is denied, check for any approved WFH within a reasonable range
      if ((!data || data.length === 0) && locationError) {
        console.log('🔄 No exact date match found, checking for any approved WFH requests...');
        const { data: alternativeData, error: altError } = await supabase
          .from('out_of_town_requests')
          .select('*')
          .eq('employee_id', profile.employee_id)
          .eq('status', 'approved')
          .order('start_date', { ascending: false })
          .limit(5);
        
        if (!altError && alternativeData && alternativeData.length > 0) {
          console.log('📋 Found approved WFH requests:', alternativeData);
          // Allow WFH if there's any recent approved request (within 3 days)
          const recentApproval = alternativeData.find(req => {
            const startDate = new Date(req.start_date);
            const daysDiff = Math.abs((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            return daysDiff <= 3;
          });
          
          if (recentApproval) {
            data = [recentApproval];
            console.log('✅ Using recent WFH approval due to location access denial:', recentApproval);
          }
        }
      }

      if (error) {
        console.error('❌ Error checking WFH request:', error);
        return;
      }

      console.log('📊 WFH request query result:', {
        data,
        count: data?.length,
        hasApproved: data && data.length > 0,
        query: `employee_id=${profile.employee_id}, status=approved, start_date<=${todayString}, end_date>=${todayString}`
      });
      
      const hasApproved = data && data.length > 0;
      
      console.log('🔄 Setting hasApprovedWFH to:', hasApproved);
      setHasApprovedWFH(hasApproved);
      
      if (hasApproved) {
        console.log('✅ Approved WFH found:', data[0]);
        console.log('📝 WFH Details:', {
          id: data[0].id,
          start_date: data[0].start_date,
          end_date: data[0].end_date,
          status: data[0].status,
          employee_id: data[0].employee_id
        });
      } else {
        console.log('❌ No approved WFH found for today');
      }
    } catch (error) {
      console.error('❌ Exception in checkApprovedWFHRequest:', error);
    }
  };

  useEffect(() => {
    checkApprovedWFHRequest();
  }, [profile?.employee_id, locationError]);

  return {
    hasApprovedWFH,
    refreshWFHStatus: checkApprovedWFHRequest
  };
};