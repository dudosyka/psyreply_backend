import { registerAs } from '@nestjs/config';

export default registerAs('mailer', () => {
  return {
    transporterOptions: {
      host: 'smtp.yandex.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_LOGIN,
        pass: process.env.MAIL_PASSWORD,
      },
    },
    sendOptions: {
      from: 'Reply | Reply <yan@psyreply.com>',
    },
  };
});
