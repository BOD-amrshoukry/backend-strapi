/**
 * plan controller
 */

import { factories } from '@strapi/strapi';
import { generateClientToken, createTransaction } from '../services/braintree';

export default factories.createCoreController(
  'api::plan.plan',
  ({ strapi }) => ({
    async getClientToken(ctx) {
      try {
        const token = await generateClientToken();
        ctx.body = { clientToken: token };
      } catch (err) {
        ctx.badRequest('Failed to generate client token', { error: err });
      }
    },

    async checkout(ctx) {
      const { nonce, amount, planId } = ctx.request.body;
      try {
        const transaction = await createTransaction(nonce, amount);
        await strapi.db.query('api::plan.plan').updateMany({
          where: { id: { $ne: planId } },
          data: { isActive: false },
        });

        await strapi.db.query('api::plan.plan').updateMany({
          where: { planId: { $eq: planId } },
          data: { isActive: true },
        });

        ctx.body = { transaction };
      } catch (err) {
        ctx.badRequest('Transaction failed', { error: err });
      }
    },
  }),
);

