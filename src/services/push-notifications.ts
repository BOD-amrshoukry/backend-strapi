import webpush from 'web-push';

export const sendPushNotificationToUser = async (
  userId: number,
  payload: { title: string; message: string },
) => {
  webpush.setVapidDetails(
    'mailto:admin@example.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  // use global `strapi` object
  const subscriptions = await strapi.db
    .query('api::push-subscription.push-subscription')
    .findMany({
      where: { user: userId },
    });

  // Store a notification in Strapi
  try {
    await strapi.db.query('api::notification.notification').create({
      data: {
        user: userId,
        head: payload.title,
        description: payload.message,
        isRead: false,
      },
    });
  } catch (err) {
    strapi.log.error(`Failed to create notification for user ${userId}`, err);
  }

  for (const sub of subscriptions) {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.keys_p256dh,
        auth: sub.keys_auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    } catch (err) {
      strapi.log.error(
        `Failed to send notification to endpoint ${sub.endpoint}`,
        err,
      );
    }
  }
};

