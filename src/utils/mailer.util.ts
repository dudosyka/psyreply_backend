import {createTransport, Transporter} from "nodemailer";
import mailerConf from "../confs/mailer.conf";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import {Injectable} from "@nestjs/common";

@Injectable()
export class MailerUtil {
    private transporter: Transporter

    constructor() {
        const transport = new SMTPTransport({
            ...mailerConf.transporterOptions
        });
        this.transporter = createTransport(transport)
    }

    sendText(to: string, subject: string, text: string): Promise<boolean> {
        return this.transporter.sendMail({
            ...mailerConf.sendOptions,
            to, subject, text
        }).then(() => true).catch(() => false)
    }

    sendHtml(to: string, subject: string, html: string): Promise<boolean> {
        return this.transporter.sendMail({
            ...mailerConf.sendOptions,
            to, subject, html
        }).then(() => true).catch(() => false)
    }
}
