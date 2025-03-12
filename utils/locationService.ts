import { Platform, PermissionsAndroid, NativeModules, AppState } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import BackgroundTimer from 'react-native-background-timer';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  altitude?: number;
  heading?: number;
  timestamp: number;
}

type LocationCallback = (location: LocationData) => void;
type ErrorCallback = (error: any) => void;

let tracking = false;
let timerId: number | null = null;
let watchId: number | null = null;
let highAccuracyMode = true;

/**
 * Request location permissions on Android and iOS
 */
const requestLocationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const status = await Geolocation.requestAuthorization('whenInUse');
    return status === 'granted';
  } 
  
  // For Android
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      // Only needed for Android >= 10
      ...(Platform.Version >= 29 
        ? [PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION] 
        : [])
    ]);
    
    return (
      granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
      (Platform.Version < 29 || 
       granted['android.permission.ACCESS_BACKGROUND_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED)
    );
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

/**
 * Start tracking location in background and foreground
 */
export const startLocationTracking = async (
  onLocation: LocationCallback, 
  onError?: ErrorCallback
): Promise<boolean> => {
  if (tracking) return true;
  
  const hasPermissions = await requestLocationPermissions();
  if (!hasPermissions) {
    if (onError) onError('Location permissions denied');
    return false;
  }

  try {
    // For foreground tracking, use watchPosition
    watchId = Geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          timestamp: position.timestamp
        };
        
        onLocation(locationData);
        console.log('📍 Location update (foreground):', locationData);
      },
      (error) => {
        if (onError) onError(error);
        console.error('📍 Error watching position:', error);
      },
      { 
        enableHighAccuracy: highAccuracyMode, // Fixed: using correct variable
        distanceFilter: 5, // Update if device moves 5 meters
        interval: 5000, // Request updates every 5 seconds
        fastestInterval: 3000, // Don't accept updates more often than every 3 seconds
        maxWaitTime: 10000, // Wait max 10 seconds for location
      }
    );

    // For background tracking, we need a more reliable approach
    if (Platform.OS === 'android') {
      // First enable foreground service
      if (Geolocation.startForegroundService) {
        await Geolocation.startForegroundService();
        console.log('📍 Location foreground service started');
      }
      
      // Stop any existing timer
      if (timerId !== null) {
        BackgroundTimer.clearInterval(timerId);
      }
      
      // Start background timer that keeps running even when app is in background
      BackgroundTimer.start();
      
      // Create a new timer to fetch location every 5 seconds
      timerId = BackgroundTimer.setInterval(() => {
        // Check if app is in background
        const currentAppState = AppState.currentState;
        console.log(`📍 Background timer tick, AppState: ${currentAppState}`);
        
        Geolocation.getCurrentPosition(
          (position) => {
            const locationData: LocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              speed: position.coords.speed,
              altitude: position.coords.altitude,
              heading: position.coords.heading,
              timestamp: position.timestamp
            };
            
            onLocation(locationData);
            console.log('📍 Location update (background):', locationData);
          },
          (error) => {
            if (onError) onError(error);
            console.error('📍 Error getting position:', error);
          },
          { 
            enableHighAccuracy: highAccuracyMode, // Fixed: using correct variable
            timeout: 10000,
            maximumAge: 1000, // Accept locations up to 1 second old
          }
        );
      }, 5000); // Execute every 5 seconds
    }

    tracking = true;
    console.log('📍 Location tracking started with 5-second interval');
    return true;
  } catch (error) {
    if (onError) onError(error);
    console.error('📍 Error starting location tracking:', error);
    return false;
  }
};

/**
 * Stop background location tracking
 */
export const stopLocationTracking = (): boolean => {
  if (!tracking) return true;
  
  try {
    // Stop foreground tracking
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      watchId = null;
    }
    
    // Stop foreground service on Android
    if (Platform.OS === 'android' && Geolocation.stopForegroundService) {
      Geolocation.stopForegroundService();
      console.log('📍 Location foreground service stopped');
    }
    
    // Stop background timer
    if (timerId !== null) {
      BackgroundTimer.clearInterval(timerId);
      timerId = null;
      BackgroundTimer.stop();
    }
    
    tracking = false;
    console.log('📍 Location tracking stopped');
    return true;
  } catch (error) {
    console.error('📍 Error stopping location tracking:', error);
    return false;
  }
};

/**
 * Get a single location update with current position and accuracy
 */
export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise(async (resolve, reject) => {
    try {
      const hasPermissions = await requestLocationPermissions();
      if (!hasPermissions) {
        reject('Location permissions denied');
        return;
      }

      // Toggle high accuracy mode to save battery if needed
      const options = {
        enableHighAccuracy: highAccuracyMode, // Fixed: using correct variable
        timeout: 15000,
        maximumAge: 10000,
        showLocationDialog: true
      };

      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            timestamp: position.timestamp
          });
        },
        (error) => {
          reject(error);
        },
        options
      );
    } catch (error) {
      reject(error);
    }
  });
};

// Toggle high accuracy mode (to save battery)
export const setHighAccuracyMode = (enabled: boolean): void => {
  highAccuracyMode = enabled;
  console.log(`📍 High accuracy mode ${enabled ? 'enabled' : 'disabled'}`);
  
  // Restart tracking if already active
  if (tracking) {
    const isTracking = tracking;
    stopLocationTracking();
    if (isTracking) {
      startLocationTracking(
        (location) => console.log('📍 Location after accuracy change:', location),
        (error) => console.error('📍 Error after accuracy change:', error)
      );
    }
  }
};

// Example usage
export const handleLocationUpdate = (location: LocationData) => {
  console.log(`
    🌍 New location: 
    📍 Lat: ${location.latitude} 
    📍 Lng: ${location.longitude}
    📊 Accuracy: ${location.accuracy}m
    🕒 Timestamp: ${new Date(location.timestamp).toLocaleTimeString()}
  `);
  
  // Here you can send the location to your server or store it locally
};
