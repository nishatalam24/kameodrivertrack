import { Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { 
  getMessaging,
  setBackgroundMessageHandler,
  onMessage,
  getToken
} from '@react-native-firebase/messaging';

// Track processed messages
const processedMessages = new Set<string>();

// Helper to prevent duplicate processing
const isDuplicate = (messageId: string | undefined): boolean => {
  if (!messageId) return false;
  if (processedMessages.has(messageId)) {
    console.log('🔄 Duplicate message detected:', messageId);
    return true;
  }
  processedMessages.add(messageId);
  return false;
};

/**
 * Initialize Firebase messaging with proper handlers
 */
export const initializeFirebaseMessaging = () => {
  if (Platform.OS !== 'android') return;

  try {
    console.log('🔥 Initializing Firebase messaging...');
    
    // Get messaging instance
    const messaging = getMessaging(getApp());
    
    // Set up background message handler
    setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('📱 BACKGROUND MESSAGE HANDLER TRIGGERED');
      console.log('⏰ Time:', new Date().toLocaleTimeString());
      
      if (remoteMessage?.messageId && isDuplicate(remoteMessage.messageId)) {
        return Promise.resolve();
      }

      // Extract notification data
      const notificationType = remoteMessage?.data?.type || 'unknown';
      console.log(`📱 Processing ${notificationType} notification in background`);

      // Return a promise to keep the background task active until processing is complete
      return Promise.resolve();
    });
    
    console.log('🔥 Firebase messaging initialized successfully');
  } catch (error) {
    console.error('🔥 Error initializing Firebase messaging:', error);
  }
};

/**
 * Get FCM token for the device
 */
export const getFCMToken = async () => {
  if (Platform.OS !== 'android') return null;
  
  try {
    const messaging = getMessaging(getApp());
    return await getToken(messaging);
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};
