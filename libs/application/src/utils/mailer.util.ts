import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { UserModel } from '../modules/user/models/user.model';

@Injectable()
export class MailerUtil {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: UserModel) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: `Попытка авторизации ${user.emailCode}`,
      html: `<!DOCTYPE html>
            <html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Aprove</title>
</head>
<body>
<div class="main">
    <div class="container">
        <div class="logobox">
            <div>
                <img alt="logo" class="logo" src="https://nocode.psyreply.com/textlogo.png"></div>
            <div>
        </div>
        <div class="dialog">
            <h4 class="dialog__header">Ваш код подтверждения:</h4>
            <h1 class="dialog__code">${user.emailCode}</h1>
        </div>

    </div>
    </div>
</body>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
    html {
        font-family: 'Rubik', sans-serif;
        border-radius: 1.25rem;
    }
    body {
        background-image: url("https://malinka.psyreply.com/img/bg.052a67fd.png");
        height: 100vh;
        display: flex;
        border-radius: 1.25rem;
    }
    .dialog__header {
        color: white;
        opacity: 0.8;
        font-weight: 500;
        font-size: 0.9rem;
        text-align: center;
    }
    .dialog__code {
        color: white;
        text-align: center;
        font-size: 3rem;
        background-color: rgba(255, 255, 255, 0.13);
        padding: 1.25rem;
        border-radius: 1.25rem;
        border: 0.125rem solid rgba(255, 255, 255, 0.26);
    }
    .logobox {
        display: block;
        margin-left: auto;
        margin-right: auto;
    }
    .logo {
        width: 13rem;
        display: block;
        margin-left: auto;
        margin-right: auto;
    }
    .main {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .container {
        background: linear-gradient(140.62deg,hsla(0,0%,100%,.25) 2.81%,hsla(0,0%,100%,.1) 100.82%);
        padding: 3.0625rem 3.0625rem;
        box-shadow: 0 0.25rem 3.25rem rgb(144 0 255 / 11%);
        border-radius: 1rem;
        border-color: rgba(255, 255, 255, 0.18);
        border-width: 0.125rem;
        border-style: solid;
    }
    .subtext {
        opacity: 0.5;
        margin-left: 0.4375rem;
    }
</style>
</html>
      `,
    });
  }
}
