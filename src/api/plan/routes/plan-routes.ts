import { factories } from '@strapi/strapi';

export default {
  routes: [
    {
      method: 'GET',
      path: '/plans/braintree/client-token',
      handler: 'plan.getClientToken',
    },
    {
      method: 'POST',
      path: '/plans/braintree/checkout',
      handler: 'plan.checkout',
    },
  ],
};

