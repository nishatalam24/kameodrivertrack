// // This file ensures notification handlers are registered before components are loaded
// import { registerNotificationHandler } from './utils/notificationHandlers';
// import { AppRegistry } from 'react-native';
// import { getApp } from '@react-native-firebase/app';
// import { 
//   getMessaging, 
//   requestPermission,
//   onMessage,
//   setBackgroundMessageHandler,
//   getInitialNotification,
//   onNotificationOpenedApp 
// } from '@react-native-firebase/messaging';
// import messaging from '@react-native-firebase/messaging';

// import { Alert } from 'react-native';

// // Get messaging instance with modular API
// const messagingInstance = getMessaging(getApp());
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('FCM Background Message:', remoteMessage);
//   // You can perform any action here (e.g., saving to AsyncStorage, updating state)
// });


// // Request notification permission early
// requestPermission(messagingInstance)
//   .then(() => {
//     console.log('📩 Permission granted');
//   })
//   .catch(error => {
//     console.log('📩 Permission rejected:', error);
//   });

// // Track processed messages
// const processedMessages = new Set();

// // Helper to check for duplicates
// const isDuplicate = (messageId) => {
//   if (processedMessages.has(messageId)) {
//     console.log('🔄 Duplicate message detected:', messageId);
//     return true;
//   }
//   processedMessages.add(messageId);
//   return false;
// };

// // 1. Foreground Notification Handler
// onMessage(messagingInstance, async remoteMessage => {
//   if (remoteMessage?.messageId && isDuplicate(remoteMessage.messageId)) return;
  
//   console.log('📱 FOREGROUND NOTIFICATION:', remoteMessage);
//   Alert.alert(
//     remoteMessage?.notification?.title || 'New Message',
//     remoteMessage?.notification?.body || 'You have a new notification'
//   );
// });

// // 2. Background Notification Handler
// setBackgroundMessageHandler(async remoteMessage => {
//   if (remoteMessage?.messageId && isDuplicate(remoteMessage.messageId)) return;
//   console.log('🌙 BACKGROUND NOTIFICATION:', remoteMessage);
//   return remoteMessage;
// });

// // Clean up old message IDs every 5 minutes
// setInterval(() => {
//   if (processedMessages.size > 100) {
//     const oldMessages = Array.from(processedMessages).slice(0, 50);
//     oldMessages.forEach(id => processedMessages.delete(id));
//   }
// }, 300000);

// // 3. Quit State Handler - When app is opened from terminated state
// getInitialNotification(messagingInstance)
//   .then(remoteMessage => {
//     if (remoteMessage) {
//       console.log('🚀 APP OPENED FROM QUIT STATE:', remoteMessage);
//     }
//   });

// // 4. Background to Foreground Handler
// onNotificationOpenedApp(messagingInstance, remoteMessage => {
//   if (remoteMessage) {
//     console.log('🔄 APP OPENED FROM BACKGROUND:', remoteMessage);
//   }
// });

// // Function that will execute when a notification is received before app is fully loaded
// const handleNotificationFromStartup = (message) => {
//   console.log('🔔 STARTUP NOTIFICATION HANDLER called with message:', JSON.stringify(message, null, 2));
  
//   try {
//     // Extract notification data
//     const notificationType = message?.data?.type || 'unknown';
//     console.log(`🔔 STARTUP: Processing ${notificationType} notification`);
    
//     // We can perform some basic actions here based on notification type
//     switch(notificationType) {
//       case 'chat_message':
//         console.log('🔔 STARTUP: Processing chat message notification - ACTION EXECUTED');
//         // Store the notification in AsyncStorage for later handling
//         break;
        
//       case 'promotion':
//         console.log('🔔 STARTUP: Processing promotion notification - ACTION EXECUTED');
//         // Store the promotion data
//         break;
        
//       default:
//         console.log(`🔔 STARTUP: Processing ${notificationType} notification - NO SPECIFIC HANDLER`);
//     }
//   } catch (error) {
//     console.error('🔔 Error in startup notification handler:', error);
//   }
// };

// // Register the startup notification handler
// console.log('🔔 Registering startup notification handler');
// registerNotificationHandler(handleNotificationFromStartup);

// // Register main application entry point
// AppRegistry.registerComponent('main', () => require('./App').default);


// import { AppRegistry } from 'react-native';
// import messaging from '@react-native-firebase/messaging';
// import App from './App';
// import { name as appName } from './app.json';

// console.log('🔥 Initializing Firebase Messaging');

// // 🔹 Ensure background message handler is set before the app starts
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('🔥 FCM Background Message:', remoteMessage);
//   // Perform necessary actions (e.g., storing data, sending API requests)
// });

// // 🔹 Register the application entry point
// AppRegistry.registerComponent(appName, () => App);import { AppRegistry } from 'react-native';
import { AppRegistry } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getMessaging } from '@react-native-firebase/messaging';
import 'expo-router/entry';

// Use modular API
const messaging = getMessaging(getApp());

// Register background handler only once
messaging.setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background:', remoteMessage);
});

// Register headless task only once
AppRegistry.registerHeadlessTask(
  'ReactNativeFirebaseMessagingHeadlessTask',
  () => async (taskData) => {
    console.log('Headless task received message:', taskData);
    
    try {
      const response = await fetch('https://apis.kameocabs.com/api/track', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (taskData?.data) {
        console.log('Message data:', taskData.data);
      }
    } catch (error) {
      console.error('API request failed:', error);
    }

    return Promise.resolve();
  }
);