import { Platform, Alert, AppState } from "react-native";

// Track processed messages to prevent duplicates
const processedMessages = new Set<string>();

// Add message tracking function
const isMessageProcessed = (messageId: string): boolean => {
  if (processedMessages.has(messageId)) {
    console.log('🔄 Duplicate message detected:', messageId);
    return true;
  }
  processedMessages.add(messageId);
  return false;
};

// Clean up old messages periodically
setInterval(() => {
  if (processedMessages.size > 100) {
    const messages = Array.from(processedMessages);
    messages.slice(0, 50).forEach(id => processedMessages.delete(id));
  }
}, 300000);

// Define notification handler types
export type NotificationData = {
  title?: string;
  body?: string;
  [key: string]: any;  // Allow any custom data fields
};

// Global function to handle notifications that will work across the app
let globalNotificationHandler: ((message: any) => void) | null = null;



function hello()
{
  console.log("Hello")
}



export const registerNotificationHandler = (handler: (message: any) => void) => {
  globalNotificationHandler = handler;
  console.log("🔔 Global notification handler registered: ", handler ? "Yes" : "No");
};

// 2. This function is called SECOND after Firebase receives the notification
export const processNotification = (remoteMessage: any) => {
  // Early return if no message ID or already processed
  const messageId = remoteMessage?.messageId;
  if (!messageId || isMessageProcessed(messageId)) {
    return null;
  }

  console.log('\n');
  console.log('2️⃣ PROCESS NOTIFICATION TRIGGERED SECOND');
  console.log('⏰ Time:', new Date().toLocaleTimeString());
  console.log('📱 Current App State:', AppState.currentState);
  console.log('📝 Notification:', {
    title: remoteMessage?.notification?.title,
    body: remoteMessage?.notification?.body,
  });
  console.log('📦 Data:', remoteMessage?.data);
  console.log('🎯🎯🎯 END PROCESSING NOTIFICATION 🎯🎯🎯');
  console.log('\n');

  // Add clear visual log markers for notification arrival
  console.log('🚨 =====================================');
  console.log('🚨 NEW NOTIFICATION RECEIVED');
  console.log('🚨 Time:', new Date().toLocaleTimeString());
  console.log('🚨 Raw notification:', JSON.stringify(remoteMessage, null, 2));

  // Extract important notification parts
  const notificationParts = {
    title: remoteMessage?.notification?.title,
    body: remoteMessage?.notification?.body,
    data: remoteMessage?.data,
  };
  console.log('🚨 Notification content:', JSON.stringify(notificationParts, null, 2));
  console.log('🚨 =====================================');
  hello()
  console.log('🔔 PROCESSING NOTIFICATION:', JSON.stringify(remoteMessage, null, 2));
  
  if (!remoteMessage) {
    console.log('🔔 ❌ Empty notification received');
    return {};
  }
  
  try {
    // Extract both notification data and data payload
    let notificationData: NotificationData = {
      title: remoteMessage?.notification?.title || '',
      body: remoteMessage?.notification?.body || '',
    };
    
    // Handle data payload
    if (remoteMessage.data) {
      console.log('🔔 Data payload found:', remoteMessage.data);
      // Merge data properties into notificationData
      Object.assign(notificationData, remoteMessage.data);
    } else {
      console.log('🔔 No data payload found in notification');
    }
    
    // If there's a global handler, call it
    if (globalNotificationHandler) {
      console.log('🔔 CALLING global notification handler');
      try {
        globalNotificationHandler(remoteMessage);
        console.log('🔔 Global handler executed successfully');
      } catch (error) {
        console.error('🔔 ❌ ERROR in global notification handler:', error);
      }
    } else {
      console.log('🔔 ❌ NO global notification handler registered');
    }
    
    return notificationData;
  } catch (error) {
    console.error('🔔 ❌ Error processing notification:', error);
    return {};
  }
};

// Export show last notification for backward compatibility
export const showLastNotification = processNotification;

// 3. This handler is called THIRD after processNotification
export const createAppNotificationHandler = (
  setLastMessage: Function,
  setNotificationData: Function, 
  setNotificationCount: Function,
  appState: string
) => {
  return (remoteMessage: any) => {
    // Early return if no message ID or already processed
    const messageId = remoteMessage?.messageId;
    if (!messageId || isMessageProcessed(messageId)) {
      return null;
    }

    try {
      console.log('\n');
      console.log('3️⃣ APP HANDLER TRIGGERED THIRD');
      console.log('⏰ Time:', new Date().toLocaleTimeString());
      console.log('📱 App State:', appState);
      console.log('📝 Notification Content:', {
        title: remoteMessage?.notification?.title,
        body: remoteMessage?.notification?.body,
        data: remoteMessage?.data
      });
      console.log('🔔🔔🔔 END APP HANDLER 🔔🔔🔔');
      console.log('\n');

      // Log when handler is called
      console.log('📱 =====================================');
      console.log('📱 APP NOTIFICATION HANDLER TRIGGERED');
      console.log('📱 App State:', appState);
      console.log('📱 =====================================');
      
      console.log('🔔 APP HANDLING NOTIFICATION:', JSON.stringify(remoteMessage, null, 2));
      
      const data = processNotification(remoteMessage);
      
      // Always update state with notification data
      setLastMessage(remoteMessage);
      setNotificationData(data);
      setNotificationCount((prev: number) => prev + 1);
      
      // Convert data types if needed (FCM delivers all data as strings)
      const notificationType = data.type || 'unknown';
      console.log(`🔔 Handling notification of type: ${notificationType}`);
      
      // Execute different functions based on notification type
      switch (notificationType) {
        case 'chat_message':
          console.log('🔔 Received chat message notification - EXECUTING FUNCTION');
          // Extract data
          const sender = data.sender || 'Unknown';
          const messageId = data.messageId || 'Unknown';
          console.log(`🔔 Chat message from ${sender}, ID: ${messageId}`);
          // Implement your chat message handling here
          break;
          
        case 'promotion':
          console.log('🔔 Received promotion notification - EXECUTING FUNCTION');
          // Implement your promotion handling here
          break;
          
        default:
          console.log(`🔔 Received ${notificationType} notification - NO SPECIAL HANDLER`);
          // Default notification handling
      }
      
      // Show an alert if app is in foreground
      if (appState === 'active') {
        console.log('🔔 App is active, showing alert');
        Alert.alert(
          data.title || remoteMessage?.notification?.title || 'New Notification',
          data.body || remoteMessage?.notification?.body || 'You received a new notification',
          [{ text: 'OK', onPress: () => console.log('🔔 Alert OK Pressed') }]
        );
      } else {
        console.log('🔔 App is not active, skipping alert. Current state:', appState);
      }
      
      return data;
    } catch (error) {
      console.error('🔔 ❌ Error in app notification handler:', error);
      return {};
    }
  };
};
