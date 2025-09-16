export default {
  routes: [
    {
      method: 'POST',
      path: '/members/login',
      handler: 'member.login',
      config: {
        auth: false, // make login public
      },
    },
  ],
};

