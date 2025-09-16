// path: src/extensions/users-permissions/strapi-server.js
import jwt from 'jsonwebtoken';

export default (plugin) => {
  const originalLogin = plugin.controllers.auth.callback;

  plugin.controllers.auth.callback = async (ctx) => {
    // Call the original login method
    await originalLogin(ctx);

    // If login successful, ctx.body will contain JWT & user data
    if (ctx.body?.jwt) {
      const user = ctx.body.user;

      // Generate a new token with custom fields
      const customToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          type: user.type, // example custom field
          // Add any other fields you need
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '7d' },
      );

      ctx.body.jwt = customToken;
    }

    return ctx.body;
  };

  return plugin;
};

