
import { useState, useEffect } from 'react';
import { reverseGeocode as geoapifyReverseGeocode } from '../services/geoapifyService';

// Default location: Lusaka, Zambia (fallback when geolocation fails)
const DEFAULT_LOCATION = {
  lat: -15.3875,
  lng: 28.3228,
  address: 'Lusaka, Zambia'
};

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    address: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const reverseGeocodeLocation = async (lat: number, lng: number): Promise<string> => {
      try {
        const result = await geoapifyReverseGeocode(lat, lng);
        return result?.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      } catch (error) {
        console.error('Reverse geocode error:', error);
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    };

    const handleSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      try {
        const address = await reverseGeocodeLocation(latitude, longitude);
        setLocation({
          latitude,
          longitude,
          address,
          loading: false,
          error: null
        });
      } catch (error) {
        setLocation({
          latitude,
          longitude,
          address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          loading: false,
          error: null
        });
      }
    };

    const handleError = async (error: GeolocationPositionError) => {
      console.warn('Geolocation error, using default location:', error.message);
      
      // Use default Lusaka location when geolocation fails
      try {
        const address = await reverseGeocodeLocation(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
        setLocation({
          latitude: DEFAULT_LOCATION.lat,
          longitude: DEFAULT_LOCATION.lng,
          address,
          loading: false,
          error: null
        });
      } catch {
        setLocation({
          latitude: DEFAULT_LOCATION.lat,
          longitude: DEFAULT_LOCATION.lng,
          address: DEFAULT_LOCATION.address,
          loading: false,
          error: null
        });
      }
    };

    if (!navigator.geolocation) {
      // Fallback to default location
      setLocation({
        latitude: DEFAULT_LOCATION.lat,
        longitude: DEFAULT_LOCATION.lng,
        address: DEFAULT_LOCATION.address,
        loading: false,
        error: null
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    });
  }, []);

  return location;
};
