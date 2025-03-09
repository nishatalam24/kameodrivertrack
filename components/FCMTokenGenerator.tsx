import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { 
  getMessaging,
  getToken as getFCMToken,
  requestPermission,
  AuthorizationStatus
} from '@react-native-firebase/messaging';

/**
 * FCM Token Generator Component
 * A clean component that handles FCM token generation and display
 */
const FCMTokenGenerator = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get messaging instance (new modular API)
  const messagingInstance = getMessaging(getApp());

  /**
   * Generate FCM token for the device
   */
  const generateToken = async () => {
    if (Platform.OS !== 'android') {
      setError('FCM token generation is only supported on Android');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check permission
      const authStatus = await requestPermission(messagingInstance);
      const enabled = 
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        setError('Notification permissions are not enabled');
        setLoading(false);
        return;
      }

      // Get token
      const fcmToken = await getFCMToken(messagingInstance);
      setToken(fcmToken);
      console.log('FCM Token:', fcmToken);
    } catch (err) {
      console.error('Error generating FCM token:', err);
      setError('Failed to generate token: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FCM Token Generator</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <Button
          title="Generate Token"
          onPress={generateToken}
          disabled={loading}
        />
      </View>
      
      {loading && (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      )}
      
      {token && (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenTitle}>FCM Token:</Text>
          <ScrollView style={styles.tokenScrollView}>
            <Text style={styles.tokenText} selectable={true}>
              {token}
            </Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  loader: {
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  errorText: {
    color: '#d32f2f',
  },
  tokenContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  tokenTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tokenScroll: {
    maxHeight: 100,
    marginBottom: 8,
  },
  tokenText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
});

export default FCMTokenGenerator;
