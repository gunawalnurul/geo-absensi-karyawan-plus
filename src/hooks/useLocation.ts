import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentLocation, calculateDistance } from '@/utils/locationUtils';

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isWithinGeofence, setIsWithinGeofence] = useState(false);
  const [nearestLocation, setNearestLocation] = useState<any>(null);
  const [geofenceLocations, setGeofenceLocations] = useState<any[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const fetchGeofenceLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('geofence_locations')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching geofence locations:', error);
        return;
      }

      console.log('📍 Geofence locations fetched:', data?.length);
      setGeofenceLocations(data || []);
    } catch (error) {
      console.error('Error fetching geofence locations:', error);
    }
  };

  const getLocation = async () => {
    if (isLoadingLocation) {
      console.log('📍 Location request already in progress, skipping...');
      return;
    }

    setIsLoadingLocation(true);
    console.log('📍 Starting location acquisition...');
    
    try {
      const coords = await getCurrentLocation();
      setCurrentLocation(coords);
      setLocationError('');
      console.log('✅ Location successfully obtained and set:', coords);
    } catch (error) {
      const errorMessage = (error as Error).message;
      setLocationError(errorMessage);
      console.log('❌ Location error:', errorMessage);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const checkGeofenceStatus = () => {
    if (!currentLocation) return;

    let closestLocation = null;
    let minDistance = Infinity;
    let withinAnyGeofence = false;

    geofenceLocations.forEach(location => {
      const distance = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        parseFloat(location.lat),
        parseFloat(location.lng)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestLocation = { ...location, distance };
      }

      if (distance <= location.radius) {
        withinAnyGeofence = true;
      }
    });

    console.log('🎯 Geofence check result:', {
      withinAnyGeofence,
      closestDistance: closestLocation?.distance,
      closestLocation: closestLocation?.name
    });

    setNearestLocation(closestLocation);
    setIsWithinGeofence(withinAnyGeofence);
  };

  useEffect(() => {
    getLocation();
    fetchGeofenceLocations();
  }, []);

  useEffect(() => {
    if (currentLocation && geofenceLocations.length > 0) {
      checkGeofenceStatus();
    }
  }, [currentLocation, geofenceLocations]);

  return {
    currentLocation,
    locationError,
    isWithinGeofence,
    nearestLocation,
    geofenceLocations,
    isLoadingLocation,
    refreshLocation: getLocation
  };
};