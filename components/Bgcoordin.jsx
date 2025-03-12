import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, AppState } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TRACKING_STATUS_KEY = '@tracking_status';
const LOCATION_TASK_NAME = 'background-location-task';

// ✅ Ensure TaskManager is always registered
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error('Background location task error:', error);
        return;
    }
    if (data) {
        const { locations } = data;
        const location = locations[0];
        console.log('New location received:', location);

        try {
            const locationData = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy,
                timestamp: new Date().toISOString()
            };
            await AsyncStorage.setItem('lastLocation', JSON.stringify(locationData));
        } catch (err) {
            console.error('Error saving location:', err);
        }
    }
});

const Bgcoordin = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState(null);
    const [coordinates, setCoordinates] = useState(null);

    useEffect(() => {
        let locationSubscription = null;

        const recoverTracking = async () => {
            try {
                const wasTracking = await AsyncStorage.getItem(TRACKING_STATUS_KEY);
                if (wasTracking === 'true') {
                    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
                    if (!isRegistered) {
                        console.log('Recovering location tracking...');
                        await handleStartTracking();
                    }
                }
            } catch (err) {
                console.error('Error recovering tracking state:', err);
            }
        };
    
        recoverTracking();

        // ✅ Foreground location updates
        const startWatching = async () => {
            try {
                locationSubscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 1000,
                        distanceInterval: 0
                    },
                    (location) => {
                        console.log('Foreground location update:', location);
                        setCoordinates({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            accuracy: location.coords.accuracy,
                            timestamp: new Date().toISOString()
                        });
                    }
                );
            } catch (err) {
                console.error('Error watching location:', err);
            }
        };

        if (isTracking) {
            startWatching();
        }

        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [isTracking]);

    const handleStartTracking = async () => {
        try {
            // ✅ Check if already tracking
            const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
            if (isRegistered) {
                console.log("Task is already running");
                return;
            }

            // ✅ Request permissions properly
            const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
            const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

            if (foregroundStatus !== 'granted' || backgroundStatus !== 'granted') {
                setError('Location permissions required');
                return;
            }

            // ✅ Start background tracking
            await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 1000,
                distanceInterval: 0,
                foregroundService: {
                    notificationTitle: 'Location Tracking Active',
                    notificationBody: 'Tracking will continue in background',
                    notificationColor: '#FF0000',
                    killServiceOnDestroy: false,  // Prevents task from stopping when app is closed
                    startForeground: true
                },
                pausesUpdatesAutomatically: false,
                showsBackgroundLocationIndicator: true,
                android: {
                    sticky: true,
                    activityType: Location.ActivityType.OTHER,
                    accuracy: Location.Accuracy.High
                }
            });

            await AsyncStorage.setItem(TRACKING_STATUS_KEY, 'true');
            setIsTracking(true);
            setError(null);
        } catch (err) {
            setError('Failed to start tracking: ' + err.message);
            console.error('Start tracking error:', err);
        }
    };

    const handleStopTracking = async () => {
        try {
            const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
            if (isRegistered) {
                await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            }
            await AsyncStorage.setItem(TRACKING_STATUS_KEY, 'false');
            setIsTracking(false);
            setError(null);
        } catch (err) {
            setError('Failed to stop tracking');
            console.error('Stop tracking error:', err);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.status}>
                Status: {isTracking ? 'Tracking' : 'Not Tracking'}
            </Text>
            {error && <Text style={styles.error}>{error}</Text>}
            
            {coordinates && (
                <View style={styles.coordinatesContainer}>
                    <Text style={styles.coordText}>
                        Latitude: {coordinates.latitude.toFixed(6)}
                    </Text>
                    <Text style={styles.coordText}>
                        Longitude: {coordinates.longitude.toFixed(6)}
                    </Text>
                    <Text style={styles.coordText}>
                        Accuracy: ±{coordinates.accuracy.toFixed(0)}m
                    </Text>
                    <Text style={styles.coordText}>
                        Updated: {new Date(coordinates.timestamp).toLocaleTimeString()}
                    </Text>
                </View>
            )}
            
            <Button 
                title={isTracking ? "Stop Tracking" : "Start Tracking"}
                onPress={isTracking ? handleStopTracking : handleStartTracking}
            />
            <Text>Or</Text>
             <Button 
                title={ "Stop Tracking"}
                onPress={ handleStopTracking }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    coordinatesContainer: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        width: '100%',
    },
    coordText: {
        fontSize: 14,
        marginBottom: 5,
    },  
    container: {
        padding: 20,
        alignItems: 'center'
    },
    status: {
        marginBottom: 20,
        fontSize: 16
    },
    error: {
        color: 'red',
        marginBottom: 10
    }
});

export default Bgcoordin;
