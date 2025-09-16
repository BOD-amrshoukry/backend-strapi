import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::notification.notification',
  ({ strapi }) => ({
    async markAllAsRead(ctx) {
      try {
        const { userId } = ctx.request.body;

        if (!userId) {
          return ctx.badRequest('Missing userId parameter');
        }

        // 1. Fetch all unread notifications for this user
        const notifications = await strapi.db
          .query('api::notification.notification')
          .findMany({
            where: {
              user: { id: userId },
              isRead: false,
            },
            select: ['id'],
          });

        if (!notifications.length) {
          return ctx.send({ message: 'No unread notifications' });
        }

        // 2. Update each notification individually
        await Promise.all(
          notifications.map((notif) =>
            strapi.db.query('api::notification.notification').update({
              where: { id: notif.id },
              data: { isRead: true },
            }),
          ),
        );

        return ctx.send({
          message: `Marked ${notifications.length} notifications as read`,
        });
      } catch (err) {
        console.error(err);
        ctx.internalServerError('Failed to mark notifications as read', {
          error: err,
        });
      }
    },

    async getCounts(ctx) {
      const { userId } = ctx.params;
      if (!userId) return ctx.badRequest('Missing userId');

      const readCount = await strapi.db
        .query('api::notification.notification')
        .count({
          where: { user: { id: userId }, isRead: true },
        });

      const unreadCount = await strapi.db
        .query('api::notification.notification')
        .count({
          where: { user: { id: userId }, isRead: false },
        });

      return ctx.send({ readCount, unreadCount });
    },
  }),
);

