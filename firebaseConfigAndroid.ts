// This file now just re-exports from the utils files for backward compatibility
import { 
  processNotification,
  NotificationData,
  registerNotificationHandler,
  showLastNotification 
} from './utils/notificationHandlers';

import {
  messaging,
  getToken,
  createNotificationChannel
} from './utils/firebaseUtils';

export {
  processNotification,
  NotificationData,
  registerNotificationHandler,
  showLastNotification,
  messaging,
  getToken,
  createNotificationChannel
};
