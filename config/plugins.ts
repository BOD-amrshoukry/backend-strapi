export default ({ env }) => ({
  // ...
  'users-permissions': {
    config: {
      register: {
        allowedFields: ['name', 'type'], // Add 'name' or any other custom fields here
      },
    },
  },
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'), // e.g., smtp.gmail.com
        port: parseInt(env('SMTP_PORT')), // usually 587 or 465
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('SMTP_DEFAULT_FROM', 'noreply@example.com'),
        defaultReplyTo: env('SMTP_DEFAULT_REPLYTO', 'support@example.com'),
      },
    },
  },
  // ...
});

