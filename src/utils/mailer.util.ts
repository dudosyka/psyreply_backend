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
            subject: 'New authorization',
            text: `Confirmation code ${user.emailCode}`
        });
    }
//curl -F "url=https://my-telegram-bot-server.herokuapp.com/new-message" https://api.telegram.org/5838390355:AAEBko_YSSbhv0rDmjvOxYoshhTyVmcRrFo/setWebhook
    async sendChlen(email: string, chlenUrl: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: 'Солнце озарило ваше лико, когда вы увидели, что мы отправили вам в этом письме! (' + Date.now() + ')',
            html: `<h2>Ваш член мистер сэр (или мисс госпожа)</h2> <img alt="chlen" src="cid:unique@nodemailer.com" />`,
            attachments: [{
                filename: 'chlen.png',
                path: "https:" + chlenUrl,
                cid: 'unique@nodemailer.com' //same cid value as in the html img src
            }]
        });
    }
}
