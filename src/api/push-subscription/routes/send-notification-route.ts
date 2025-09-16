export default {
  routes: [
    {
      method: 'POST',
      path: '/push-subscriptions/notify-user',
      handler: 'push-subscription.notifyUser',
    },
    {
      method: 'POST',
      path: '/push-subscriptions/remove-subscription',
      handler: 'push-subscription.removeSubscription',
    },
    {
      method: 'POST',
      path: '/push-subscriptions/check-subscription',
      handler: 'push-subscription.checkSubscription',
    },
  ],
};

