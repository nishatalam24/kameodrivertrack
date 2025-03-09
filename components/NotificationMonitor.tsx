import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, ScrollView } from 'react-native';
import messaging from '@react-native-firebase/messaging';

interface NotificationData {
  title?: string;
  body?: string;
  type?: string;
  [key: string]: any;
}

interface NotificationLogItem {
  id: string;
  title: string;
  body: string;
  receivedAt: string;
  data: any;
}

/**
 * Notification Monitor Component
 * Handles FCM notifications and permission requests
 */
const NotificationMonitor = () => {
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastNotification, setLastNotification] = useState<NotificationData | null>(null);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLogItem[]>([]);

  /**
   * Request notification permissions
   */
  const requestPermissions = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      
      if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
        setPermissionStatus('authorized');
        Alert.alert('Permission Granted', 'You will receive notifications');
      } else if (authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
        setPermissionStatus('provisional');
        Alert.alert('Provisional Permission', 'You will receive quiet notifications');
      } else {
        setPermissionStatus('denied');
        Alert.alert('Permission Denied', 'You will not receive notifications');
      }
    } catch (error) {
      console.log('Permission request failed', error);
      setPermissionStatus('error');
    }
  };

  /**
   * Check current permission status
   */
  const checkPermission = async () => {
    try {
      const authStatus = await messaging().hasPermission();
      
      if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
        setPermissionStatus('authorized');
      } else if (authStatus === messaging.AuthorizationStatus.PROVISIONAL) {
        setPermissionStatus('provisional');
      } else {
        setPermissionStatus('denied');
      }
    } catch (error) {
      console.log('Permission check failed', error);
      setPermissionStatus('error');
    }
  };

  /**
   * Process incoming notification
   */
  const processNotification = (remoteMessage: any) => {
    try {
      // Extract notification data
      const notificationType = remoteMessage?.data?.type || 'unknown';
      const title = remoteMessage?.notification?.title || 'New Notification';
      const body = remoteMessage?.notification?.body || 'You received a new notification';
      
      // Execute function based on notification type
      switch (notificationType) {
        case 'chat_message':
          console.log('Processing chat message notification');
          handleChatMessage(remoteMessage);
          break;
          
        case 'promotion':
          console.log('Processing promotion notification');
          handlePromotionNotification(remoteMessage);
          break;
          
        default:
          console.log('Processing unknown notification type');
          break;
      }
      
      // Update notification state
      setNotificationCount(prev => prev + 1);
      setLastNotification({
        title,
        body,
        type: notificationType,
        ...remoteMessage.data
      });
      
      // Add to notification log
      const newLogItem: NotificationLogItem = {
        id: remoteMessage.messageId || `notification-${Date.now()}`,
        title,
        body,
        receivedAt: new Date().toLocaleTimeString(),
        data: remoteMessage.data || {}
      };
      
      setNotificationLogs(prevLogs => [newLogItem, ...prevLogs].slice(0, 10));
      
      // Show alert for the notification
      Alert.alert(title, body);
      
      return true;
    } catch (error) {
      console.log('Error processing notification', error);
      return false;
    }
  };

  /**
   * Handle chat message notifications
   */
  const handleChatMessage = (message: any) => {
    console.log('Chat message handler executed', message);
    // Implement chat message handling logic
  };

  /**
   * Handle promotion notifications
   */
  const handlePromotionNotification = (message: any) => {
    console.log('Promotion handler executed', message);
    // Implement promotion handling logic
  };

  // Set up notification listeners
  useEffect(() => {
    // Check permission on mount
    checkPermission();
    
    // Foreground notifications handler
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification received');
      processNotification(remoteMessage);
    });
    
    // Background open notification handler
    const unsubscribeBackgroundOpen = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app from background');
      processNotification(remoteMessage);
    });
    
    // Check if app was opened from a notification when in quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from quit state with notification');
          processNotification(remoteMessage);
        }
      });
    
    // Cleanup function
    return () => {
      unsubscribeForeground();
      unsubscribeBackgroundOpen();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Notification Monitor</Text>
        <Text style={styles.status}>
          Permission: <Text style={styles[permissionStatus]}>{permissionStatus}</Text>
        </Text>
        <Text style={styles.count}>Notifications received: {notificationCount}</Text>
      </View>

      <View style={styles.actionSection}>
        <Button
          title="Request Notification Permission"
          onPress={requestPermissions}
        />
      </View>

      {lastNotification && (
        <View style={styles.lastNotificationContainer}>
          <Text style={styles.sectionTitle}>Last Notification</Text>
          <Text style={styles.notificationTitle}>{lastNotification.title}</Text>
          <Text style={styles.notificationBody}>{lastNotification.body}</Text>
          <Text style={styles.notificationType}>Type: {lastNotification.type}</Text>
        </View>
      )}

      <View style={styles.logSection}>
        <Text style={styles.sectionTitle}>Notification Log</Text>
        <ScrollView style={styles.logList}>
          {notificationLogs.map(log => (
            <View key={log.id} style={styles.logItem}>
              <Text style={styles.logTime}>{log.receivedAt}</Text>
              <Text style={styles.logTitle}>{log.title}</Text>
              <Text style={styles.logBody}>{log.body}</Text>
            </View>
          ))}
          {notificationLogs.length === 0 && (
            <Text style={styles.emptyLog}>No notifications received yet</Text>
          )}
        </ScrollView>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  authorized: {
    color: 'green',
    fontWeight: 'bold',
  },
  provisional: {
    color: 'orange',
    fontWeight: 'bold',
  },
  denied: {
    color: 'red',
    fontWeight: 'bold',
  },
  unknown: {
    color: 'gray',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
  actionSection: {
    marginBottom: 16,
  },
  lastNotificationContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationBody: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationType: {
    fontSize: 12,
    color: '#666',
  },
  logSection: {
    flex: 1,
    maxHeight: 200,
  },
  logList: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 8,
  },
  logItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8,
  },
  logTime: {
    fontSize: 10,
    color: '#666',
  },
  logTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  logBody: {
    fontSize: 12,
  },
  emptyLog: {
    textAlign: 'center',
    padding: 16,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default NotificationMonitor;
