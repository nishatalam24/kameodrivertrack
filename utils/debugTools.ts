// Debug tools for notification troubleshooting

export const checkNotificationSetup = () => {
  console.log('🔎 CHECKING NOTIFICATION SETUP...');
  
  try {
    // Check if running on Android
    const { Platform } = require('react-native');
    console.log('🔎 Platform:', Platform.OS);
    
    if (Platform.OS === 'android') {
      // Check Firebase modules
      try {
        const firebase = require('@react-native-firebase/app');
        const messaging = require('@react-native-firebase/messaging');
        
        console.log('🔎 Firebase modules loaded:', {
          firebaseAvailable: !!firebase,
          messagingAvailable: !!messaging
        });
        
        console.log('🔎 Firebase apps initialized:', firebase.default.apps.length);
        
        if (messaging.default) {
          const instance = messaging.default();
          console.log('🔎 Messaging methods available:', {
            onMessage: typeof instance.onMessage === 'function',
            onNotificationOpenedApp: typeof instance.onNotificationOpenedApp === 'function',
            getInitialNotification: typeof instance.getInitialNotification === 'function',
            hasPermission: typeof instance.hasPermission === 'function',
            requestPermission: typeof instance.requestPermission === 'function',
          });
          
          // Check permissions
          instance.hasPermission()
            .then(status => console.log('🔎 Current notification permission status:', status))
            .catch(err => console.log('🔎 Error checking permission:', err));
        }
      } catch (error) {
        console.log('🔎 Error checking Firebase modules:', error);
      }
      
      // Check package name
      try {
        const { NativeModules } = require('react-native');
        console.log('🔎 App package name:', NativeModules.AppInfo?.packageName || 'Unknown');
      } catch (error) {
        console.log('🔎 Error getting package name:', error);
      }
    }
    
    // Check global handler
    const handlers = require('./notificationHandlers');
    console.log('🔎 Notification handlers loaded:', {
      processNotification: typeof handlers.processNotification === 'function',
      registerNotificationHandler: typeof handlers.registerNotificationHandler === 'function',
      showLastNotification: typeof handlers.showLastNotification === 'function',
    });
    
  } catch (error) {
    console.log('🔎 Error during notification setup check:', error);
  }
  
  console.log('🔎 NOTIFICATION SETUP CHECK COMPLETE');
};

// Export a function to send a test notification that will always trigger UI updates
export const triggerDebugNotification = (customData = {}) => {
  try {
    const { showLastNotification } = require('./notificationHandlers');
    
    console.log('🔎 Triggering debug notification...');
    
    const notification = {
      notification: {
        title: "DEBUG Notification",
        body: "This is a diagnostic notification to test the notification system"
      },
      data: {
        type: "debug_test",
        timestamp: new Date().toISOString(),
        ...customData
      }
    };
    
    showLastNotification(notification);
    console.log('🔎 Debug notification sent successfully');
    return true;
  } catch (error) {
    console.log('🔎 Error triggering debug notification:', error);
    return false;
  }
};
