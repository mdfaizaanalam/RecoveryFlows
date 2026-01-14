// LOCATION: backend/src/services/NotificationService.js

// NotificationService Interface
class NotificationService {
  async sendNotification(userId, message, type, data = {}) {
    throw new Error('sendNotification method must be implemented');
  }

  async getNotifications(userId) {
    throw new Error('getNotifications method must be implemented');
  }

  async markAsRead(notificationId) {
    throw new Error('markAsRead method must be implemented');
  }

  async markAllAsRead(userId) {
    throw new Error('markAllAsRead method must be implemented');
  }
}

// Mock Implementation with Enhanced Logging
class MockNotificationService extends NotificationService {
  constructor() {
    super();
    this.notifications = new Map(); // userId -> notifications[]
    this.notificationId = 1;
  }

  async sendNotification(userId, message, type, data = {}) {
    const notification = {
      id: this.notificationId++,
      userId,
      message,
      type,
      data,
      isRead: false,
      createdAt: new Date(),
      timestamp: Date.now()
    };

    // Store notification
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId).unshift(notification);

    // Keep only last 100 notifications per user
    const userNotifications = this.notifications.get(userId);
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }

    // Log the notification
    console.log('\n🔔 NOTIFICATION SENT');
    console.log('═'.repeat(60));
    console.log(`   User ID: ${userId}`);
    console.log(`   Type: ${type}`);
    console.log(`   Message: ${message}`);
    console.log(`   Time: ${new Date().toLocaleString()}`);
    if (Object.keys(data).length > 0) {
      console.log(`   Data:`, JSON.stringify(data, null, 2));
    }
    console.log('═'.repeat(60));

    return notification;
  }

  async getNotifications(userId) {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.sort((a, b) => b.timestamp - a.timestamp);
  }

  async markAsRead(notificationId) {
    for (const [userId, notifications] of this.notifications.entries()) {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
        console.log(`✅ Notification #${notificationId} marked as read by User #${userId}`);
        return notification;
      }
    }
    throw new Error('Notification not found');
  }

  async markAllAsRead(userId) {
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.forEach(notification => {
      notification.isRead = true;
    });
    
    console.log(`✅ All ${userNotifications.length} notifications marked as read for User #${userId}`);
    
    return userNotifications;
  }

  async getUnreadCount(userId) {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter(n => !n.isRead).length;
  }

  // Clear notifications (useful for testing)
  async clearNotifications(userId) {
    this.notifications.delete(userId);
    console.log(`🗑️ All notifications cleared for User #${userId}`);
  }

  // ✅ NEW: Broadcast to multiple users
  async sendBulkNotifications(userIds, message, type, data = {}) {
    const notifications = [];
    for (const userId of userIds) {
      const notification = await this.sendNotification(userId, message, type, data);
      notifications.push(notification);
    }
    console.log(`📢 Bulk notification sent to ${userIds.length} users`);
    return notifications;
  }
}

// Export singleton instance
const notificationService = new MockNotificationService();

module.exports = {
  NotificationService,
  MockNotificationService,
  notificationService
};
