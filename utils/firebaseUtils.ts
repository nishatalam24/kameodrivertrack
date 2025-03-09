import { Platform } from "react-native";
import { firebaseConfig } from '../firebaseConfig';
import { processNotification } from './notificationHandlers';

// For Android, we need to use the React Native Firebase SDK
let messaging: any = {};
let getToken = async () => "android-mock-token";

// Initialize Firebase for Android
if (Platform.OS === 'android') {
  try {
    // Import Firebase modules
    const firebaseApp = require('@react-native-firebase/app');
    const firebaseMessaging = require('@react-native-firebase/messaging');
    
    // Initialize Firebase app if not already initialized
    if (!firebaseApp.default.apps || firebaseApp.default.apps.length === 0) {
      console.log('🔔 Initializing Firebase app with config:', JSON.stringify(firebaseConfig, null, 2));
      firebaseApp.default.initializeApp(firebaseConfig);
    } else {
      console.log('🔔 Firebase app already initialized');
    }
    
    // Get the messaging instance
    messaging = firebaseMessaging.default();
    console.log('🔔 Firebase messaging initialized');
    
    // Enhanced background message handler specifically for Samsung devices
    firebaseMessaging.default().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('\n');
      console.log('📱 SAMSUNG BACKGROUND HANDLER TRIGGERED');
      console.log('⏰ Time:', new Date().toLocaleTimeString());
      console.log('📦 Message:', JSON.stringify(remoteMessage, null, 2));

      // Force wake lock to ensure processing completes
      const wakeLock = require('react-native').NativeModules.PowerManager;
      if (wakeLock?.newWakeLock) {
        const lock = await wakeLock.newWakeLock('PARTIAL_WAKE_LOCK', 'NotificationHandler');
        try {
          return await processNotification(remoteMessage);
        } finally {
          lock.release();
        }
      }

      return processNotification(remoteMessage);
    });

    // Add explicit background state check for Samsung devices
    messaging.onMessage(async remoteMessage => {
      const { AppState } = require('react-native');
      const currentState = AppState.currentState;
      
      console.log('\n');
      console.log(`📱 NOTIFICATION RECEIVED IN ${currentState.toUpperCase()}`);
      console.log('⏰ Time:', new Date().toLocaleTimeString());
      console.log('📦 Message:', JSON.stringify(remoteMessage, null, 2));
      
      // Ensure we process even if app is in background
      if (currentState === 'background' || currentState === 'inactive') {
        return firebaseMessaging.default().setBackgroundMessageHandler(remoteMessage);
      }
      
      return processNotification(remoteMessage);
    });

    // Function to get the FCM token
    getToken = async () => {
      try {
        // Check if permission is already granted
        const currentPermission = await messaging.hasPermission();
        let authorized = currentPermission === firebaseMessaging.default.AuthorizationStatus.AUTHORIZED ||
                        currentPermission === firebaseMessaging.default.AuthorizationStatus.PROVISIONAL;
        
        if (!authorized) {
          console.log('🔔 Requesting FCM permission');
          // Request permission explicitly
          const authStatus = await messaging.requestPermission();
          authorized = authStatus === firebaseMessaging.default.AuthorizationStatus.AUTHORIZED ||
                      authStatus === firebaseMessaging.default.AuthorizationStatus.PROVISIONAL;
          
          if (!authorized) {
            console.log('🔔 ❌ Firebase messaging permission denied');
            return null;
          }
        }
        
        console.log('🔔 Firebase messaging permission granted');
        
        // Get the real FCM token
        const fcmToken = await messaging.getToken();
        console.log('🔔 Your Firebase Token is:', fcmToken);
        return fcmToken;
      } catch (error) {
        console.error("🔔 ❌ Error getting FCM token:", error);
        return null;
      }
    };
    
  } catch (error) {
    console.error("🔔 ❌ Error initializing Android Firebase messaging:", error);
  }
}

// SIMPLIFIED: Create a basic notification channel to ensure notifications work
export const createNotificationChannel = () => {
  if (Platform.OS === 'android') {
    try {
      const firebaseMessaging = require('@react-native-firebase/messaging');
      
      // Check if method exists before calling it
      if (messaging && messaging.android && typeof messaging.android.createChannel === 'function') {
        console.log('🔔 Creating notification channel');
        
        messaging.android.createChannel({
          id: 'default-channel',
          name: 'Default Channel',
          description: 'Default notification channel',
          importance: 4, // HIGH
          vibrationPattern: [300, 500], // Vibration pattern for better notification visibility
          lightColor: '#FF453A', // Light color for notifications with LED
        })
        .then(() => console.log('🔔 Notification channel created successfully'))
        .catch(error => console.error('🔔 ❌ Error creating notification channel:', error));
      } else {
        console.log('🔔 createChannel method not available, might be using an older Firebase version');
      }
    } catch (error) {
      console.error('🔔 ❌ Failed to create notification channel:', error);
    }
  }
};

export { messaging, getToken };
