import { sendPushNotificationToUser } from '../../../services/push-notifications';
import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::push-subscription.push-subscription',
  ({ strapi }) => ({
    async notifyUser(ctx) {
      const { userId, title, message } = ctx.request.body;

      if (!userId || !title || !message)
        return ctx.badRequest('Missing fields');

      await sendPushNotificationToUser(userId, { title, message });

      ctx.body = { message: 'Notification sent successfully' };
    },
    async removeSubscription(ctx) {
      const { endpoint } = ctx.request.body;

      if (!endpoint) {
        return ctx.badRequest('Missing endpoint in request body');
      }

      try {
        const deleted = await strapi.db
          .query('api::push-subscription.push-subscription')
          .deleteMany({
            where: { endpoint },
          });

        ctx.body = { message: `Deleted ${deleted} subscription(s)`, endpoint };
      } catch (err) {
        ctx.internalServerError('Failed to delete subscription', {
          error: err,
        });
      }
    },
    async checkSubscription(ctx) {
      const { endpoint } = ctx.request.body;

      if (!endpoint) {
        return ctx.badRequest('Missing endpoint in request body');
      }

      try {
        const existing = await strapi.db
          .query('api::push-subscription.push-subscription')
          .findOne({
            where: { endpoint },
          });

        ctx.body = {
          exists: !!existing,
          endpoint,
        };
      } catch (err) {
        ctx.internalServerError('Failed to check subscription', { error: err });
      }
    },
    async sendMessage(ctx) {
      const { userId, message } = ctx.request.body;
      const io = (strapi as any).io;

      io.to(`user-${userId}`).emit('notification', { message });

      ctx.body = { message: 'Notification sent via Socket.IO' };
    },
  }),
);

