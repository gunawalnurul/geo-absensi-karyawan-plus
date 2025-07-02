import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentLocation, calculateDistance } from '@/utils/locationUtils';

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isWithinGeofence, setIsWithinGeofence] = useState(false);
  const [nearestLocation, setNearestLocation] = useState<any>(null);
  const [geofenceLocations, setGeofenceLocations] = useState<any[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const locationRequestRef = useRef<Promise<{lat: number, lng: number}> | null>(null);

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
    // Prevent multiple simultaneous location requests
    if (locationRequestRef.current) {
      console.log('📍 Location request already in progress, waiting for existing request...');
      try {
        const coords = await locationRequestRef.current;
        return coords;
      } catch (error) {
        // If existing request failed, we'll continue with a new one
        console.log('📍 Previous request failed, starting new one...');
      }
    }

    if (isLoadingLocation) {
      console.log('📍 Location loading state active, skipping...');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(''); // Clear previous errors
    console.log('📍 Starting location acquisition...');
    
    // Create and store the location request promise
    locationRequestRef.current = getCurrentLocation();
    
    try {
      const coords = await locationRequestRef.current;
      setCurrentLocation(coords);
      setLocationError('');
      console.log('✅ Location successfully obtained and set:', coords);
      return coords;
    } catch (error) {
      const errorMessage = (error as Error).message;
      setLocationError(errorMessage);
      console.log('❌ Location error:', errorMessage);
      throw error;
    } finally {
      setIsLoadingLocation(false);
      locationRequestRef.current = null; // Clear the reference
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