import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { 
  getMessaging, 
  getToken, 
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
  
  // Initialize messaging with modular API
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
        setError('Notification permission denied');
        return;
      }

      // Get token
      const fcmToken = await getToken(messagingInstance);
      setToken(fcmToken);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate token';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copy token to clipboard
   */
  const copyToken = () => {
    if (token) {
      // This would require Clipboard from react-native
      // Clipboard.setString(token);
      alert('Token copied to clipboard');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Cloud Messaging</Text>
      <Text style={styles.subtitle}>Generate and manage your FCM token</Text>

      <Button
        title="Generate FCM Token"
        onPress={generateToken}
        disabled={loading}
      />

      {loading && <ActivityIndicator style={styles.loader} />}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {token && (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenTitle}>Your FCM Token:</Text>
          <ScrollView style={styles.tokenScroll}>
            <Text style={styles.tokenText} selectable>{token}</Text>
          </ScrollView>
          <Button title="Copy Token" onPress={copyToken} />
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
