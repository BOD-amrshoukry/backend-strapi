export default {
  routes: [
    {
      method: 'POST',
      path: '/notifications/mark-all-as-read',
      handler: 'notification.markAllAsRead',
    },
    {
      method: 'GET',
      path: '/notifications/counts/:userId',
      handler: 'notification.getCounts',
    },
  ],
};

