import React, { useEffect, useState, useCallback, useRef } from "react";
import { Text, View, Platform, Button, Alert, ActivityIndicator, AppState } from "react-native";
import Constants from "expo-constants";
import FCMTokenGenerator from '../components/FCMTokenGenerator';
import NotificationMonitor from '../components/NotificationMonitor';
// Import utilities from separate files
// import { 
//   NotificationData, 
//   registerNotificationHandler,
//   createAppNotificationHandler
// } from '../utils/notificationHandlers';
// import { messaging, getToken, createNotificationChannel } from '../utils/firebaseUtils';

// // Safe import of configurations for non-Android platforms
// if (Platform.OS !== 'android') {
//   try {
//     if (Platform.OS === 'web') {
//       const webConfig = require('../firebaseConfig');
//     }
//   } catch (error) {
//     console.error("Error importing non-Android Firebase config:", error);
//   }
// }

// console.log('🔔 App started');
function Index() {
  // const [fcmToken, setFcmToken] = useState<string | null>(null);
  // const [loading, setLoading] = useState(false);
  // const [lastMessage, setLastMessage] = useState<any>(null);
  // const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
  // const [appState, setAppState] = useState(AppState.currentState);
  // const [notificationCount, setNotificationCount] = useState(0);
  // const [isInitialized, setIsInitialized] = useState(false);

  // // Add ref to track if handlers are already set up
  // const handlersInitialized = useRef(false);

  // const getFCMToken = async () => {
  //   try {
  //     setLoading(true);
  //     if (Platform.OS === 'android') {
  //       console.log("🔔 Requesting Android FCM token...");
  //       const token = await getToken();
  //       console.log("🔔 Android FCM Token received:", token ? "Yes" : "No");
  //       setFcmToken(token);
  //     } else if (Platform.OS === 'web') {
  //       console.log("🔔 Requesting Web FCM token...");
  //       const token = await getToken(messaging, {
  //         vapidKey: Constants.manifest?.extra?.vapidKey || '',
  //       });
  //       console.log("🔔 Web FCM Token received:", token ? "Yes" : "No");
  //       setFcmToken(token);
  //     } else {
  //       console.log("🔔 FCM token generation is not supported on this platform");
  //     }
  //   } catch (error) {
  //     console.error("🔔 ❌ Error getting FCM token:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // // Create notification handler
  // const handleNotification = useCallback(
  //   createAppNotificationHandler(
  //     setLastMessage,
  //     setNotificationData,
  //     setNotificationCount,
  //     appState
  //   ),
  //   [appState]
  // );

  // // Monitor app state changes
  // useEffect(() => {
  //   console.log('🔔 Setting up app state monitoring, current state:', appState);
    
  //   const subscription = AppState.addEventListener('change', nextAppState => {
  //     console.log('🔔 App state changed from', appState, 'to', nextAppState);
  //     setAppState(nextAppState);
  //   });

  //   return () => {
  //     console.log('🔔 Cleaning up app state monitoring');
  //     subscription.remove();
  //   };
  // }, [appState]);

  // // Setup notification channel first
  // useEffect(() => {
  //   if (Platform.OS === 'android') {
  //     console.log('🔔 Setting up notification channel');
  //     try {
  //       createNotificationChannel();
  //     } catch (error) {
  //       console.error('🔔 ❌ Error creating notification channel:', error);
  //     }
  //   }
  // }, []);

  // // Register the global notification handler as soon as possible
  // useEffect(() => {
  //   console.log('🔔 Registering component notification handler');
  //   try {
  //     registerNotificationHandler(handleNotification);
  //     console.log('🔔 Component notification handler registered successfully');
  //   } catch (error) {
  //     console.error('🔔 ❌ Error registering notification handler:', error);
  //   }
    
  //   return () => {
  //     console.log('🔔 Cleaning up component notification handler');
  //   };
  // }, [handleNotification]);

  // // Set up notification listeners for when app is in foreground
  // useEffect(() => {
  //   if (Platform.OS === 'android' && !handlersInitialized.current) {
  //     console.log('🔔 Setting up Android notification listeners');
      
  //     try {
  //       let unsubscribe = () => {};
        
  //       // Only set up handlers if they haven't been initialized
  //       if (messaging && typeof messaging.onMessage === 'function') {
  //         unsubscribe = messaging.onMessage(async (remoteMessage: any) => {
  //           handleNotification(remoteMessage);
  //         });
  //       }
        
  //       // Mark handlers as initialized
  //       handlersInitialized.current = true;
  //       setIsInitialized(true);
        
  //       return () => {
  //         unsubscribe();
  //         handlersInitialized.current = false;
  //       };
  //     } catch (error) {
  //       console.error("🔔 ❌ Error setting up Firebase listeners:", error);
  //       return () => {};
  //     }
  //   }
  //   return () => {};
  // }, []); // Empty dependency array - only run once

  // // Get token on initial load
  // useEffect(() => {
  //   console.log('🔔 Getting FCM token');
  //   getFCMToken();
  // }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      {/* <Text style={{ fontSize: 20, marginBottom: 20 }}>
        FCM Token Test - {Platform.OS.toUpperCase()}
      </Text>
      

      <Text style={{ fontSize: 14, marginBottom: 5, color: isInitialized ? 'green' : 'orange' }}>
        Notification System: {isInitialized ? 'Initialized' : 'Initializing...'}
      </Text>
      

      <Text style={{ fontSize: 16, marginBottom: 10, color: 'blue' }}>
        Notifications received: {notificationCount}
      </Text>
      
      {loading ? (
        <Text>Loading FCM token...</Text>
      ) : (
        <>
          <Text style={{ marginBottom: 10 }}>
            {fcmToken ? "Token received! Check console for details." : "No token generated yet."}
          </Text>
          
          {fcmToken && (
            <View style={{ marginVertical: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5, width: '100%' }}>
              <Text selectable={true} style={{ fontSize: 12 }}>{fcmToken}</Text>
            </View>
          )}
          
          <Button 
            title="Generate FCM Token" 
            onPress={getFCMToken} 
          />
        </>
      )}
      

      {notificationData && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#e8f5e9', borderRadius: 5, width: '100%' }}>
          <Text style={{ fontWeight: 'bold' }}>Last Notification Data:</Text>
          <Text>Type: {notificationData.type || 'Not specified'}</Text>
          {Object.entries(notificationData).map(([key, value]) => (
            <Text key={key}>{key}: {JSON.stringify(value)}</Text>
          ))}
        </View>
      )} */}


<FCMTokenGenerator />
<NotificationMonitor />
    </View>
  );
}

export default Index;