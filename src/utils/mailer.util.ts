import {Injectable} from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { UserModel } from "../modules/user/models/user.model";

@Injectable()
export class MailerUtil {
    constructor(
      private mailerService: MailerService
    ) {
    }

    async sendUserConfirmation(user: UserModel) {
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Welcome to Nice App! Confirm your Email',
            text: `Confirmation code ${user.emailCode}`
        });
    }
}
