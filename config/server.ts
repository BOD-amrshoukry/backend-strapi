export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'a-default-random-string'),
    },
    remote: {
      enabled: true, // Enable remote data transfer
    },
  },
  app: {
    keys: env.array('APP_KEYS'),
  },
});

