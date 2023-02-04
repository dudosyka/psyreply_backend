import { MailerOptions, MailerOptionsFactory } from '@nestjs-modules/mailer';
import mailerConf from '../../../config/mailer.conf';

export class MailerOptionsModule implements MailerOptionsFactory {
  createMailerOptions(): Promise<MailerOptions> | MailerOptions {
    return {
      transport: {
        ...mailerConf().transporterOptions,
        auth: {
          user: process.env.MAIL_LOGIN,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: mailerConf().sendOptions.from,
      },
    };
  }
}
