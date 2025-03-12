import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

export const LOCATION_TASK_NAME = 'background-location-task';

// Define the task before using it
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background Location Task Error:', error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];
    console.log('Background Location Update:', {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp
    });
  }
});

export const startBackgroundTracking = async () => {
  try {
    // Request foreground permissions first
    const { status: foregroundStatus } = 
      await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.error('Foreground permission denied');
      return false;
    }

    // Then request background permissions
    const { status: backgroundStatus } = 
      await Location.requestBackgroundPermissionsAsync();
    
    if (backgroundStatus !== 'granted') {
      console.error('Background permission denied');
      return false;
    }

    // Check if task is already running
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );

    if (hasStarted) {
      console.log('Background tracking is already running');
      return true;
    }

    // Start background tracking
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5000,
      distanceInterval: 10,
      foregroundService: {
        notificationTitle: "Location Tracking",
        notificationBody: "Tracking location in background",
        notificationColor: "#FF0000"
      },
      // Android behavior
      android: {
        notification: {
          channelId: "location-tracking"
        }
      }
    });

    return true;
  } catch (error) {
    console.error('Failed to start background tracking:', error);
    return false;
  }
};

export const stopBackgroundTracking = async () => {
  try {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );
    
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('Background tracking stopped');
    }
  } catch (error) {
    console.error('Failed to stop background tracking:', error);
  }
};