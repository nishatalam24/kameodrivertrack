import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Switch } from 'react-native';
import { startLocationTracking, stopLocationTracking, getCurrentLocation, setHighAccuracyMode } from '../utils/locationService';
import { PermissionsAndroid, Platform } from 'react-native';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
  isTracking: boolean;
  updates: number; // Add a counter for updates
}

const LocationTracker = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    isTracking: false,
    updates: 0
  });
  
  const [error, setError] = useState<string | null>(null);
  const [highAccuracy, setHighAccuracy] = useState<boolean>(true);

  // Request location permissions
  const checkLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "App needs access to your location",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setError('Location permission denied');
          return false;
        }
        return true;
      } catch (err) {
        console.error("Permission check failed:", err);
        return false;
      }
    }
    return true;
  };

  // Handle location updates
  const handleLocationUpdate = (locationData: any) => {
    console.log('Location Update Received:', locationData);
    if (!locationData) {
      console.error('No location data received');
      return;
    }
    
    setLocation(prevLocation => ({
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: locationData.accuracy,
      timestamp: locationData.timestamp,
      isTracking: true,
      updates: prevLocation.updates + 1 // Increment update counter
    }));
  };
  
  // Handle errors
  const handleError = (errorMsg: any) => {
    setError(typeof errorMsg === 'string' ? errorMsg : 'Location error occurred');
    console.error('Location error:', errorMsg);
  };

  // Start tracking
  const startTracking = async () => {
    setError(null);
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      return;
    }
    
    console.log('Starting location tracking...');
    setLocation(prev => ({ ...prev, updates: 0 })); // Reset update counter
    const started = await startLocationTracking(handleLocationUpdate, handleError);
    if (started) {
      setLocation(prev => ({ ...prev, isTracking: true }));
      console.log('Location tracking started successfully');
    } else {
      console.error('Failed to start location tracking');
    }
  };

  // Stop tracking
  const stopTracking = async () => {
    stopLocationTracking();
    setLocation(prev => ({ ...prev, isTracking: false }));
  };
  
  // Get current location once
  const getOneTimeLocation = async () => {
    setError(null);
    try {
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        return;
      }
  
      console.log('Getting current location...'); // Add debug logging
      const currentLocation = await getCurrentLocation();
      console.log('Received location:', currentLocation); // Add debug logging
      handleLocationUpdate(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error); // Add detailed error logging
      handleError(error);
    }
  };
  
  // Toggle high accuracy mode
  const toggleAccuracy = (value: boolean) => {
    setHighAccuracy(value);
    setHighAccuracyMode(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Tracker</Text>
      
      <View style={styles.locationInfo}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.status}>{location.isTracking ? 'Tracking' : 'Not Tracking'}</Text>
        
        {location.latitude && location.longitude && (
          <>
            <Text style={styles.label}>Position:</Text>
            <Text>Latitude: {location.latitude.toFixed(6)}</Text>
            <Text>Longitude: {location.longitude.toFixed(6)}</Text>
            <Text>Accuracy: {location.accuracy ? `${location.accuracy.toFixed(2)}m` : 'Unknown'}</Text>
            <Text>Updated: {location.timestamp ? new Date(location.timestamp).toLocaleTimeString() : 'Never'}</Text>
            <Text style={styles.updates}>Updates received: {location.updates}</Text>
          </>
        )}
        
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
      
      <View style={styles.settingsContainer}>
        <Text style={styles.settingsLabel}>High Accuracy Mode:</Text>
        <Switch
          value={highAccuracy}
          onValueChange={toggleAccuracy}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        {!location.isTracking ? (
          <Button title="Start Tracking" onPress={startTracking} />
        ) : (
          <Button title="Stop Tracking" onPress={stopTracking} color="#FF3B30" />
        )}
        
        <Button 
          title="Get Current Location" 
          onPress={getOneTimeLocation} 
          color="#4CAF50"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  locationInfo: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  status: {
    color: 'blue',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 8,
  },
  settingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingsLabel: {
    marginRight: 8,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  updates: {
    marginTop: 8,
    color: '#666',
    fontWeight: 'bold'
  },
});

export default LocationTracker;
