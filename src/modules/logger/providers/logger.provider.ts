import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LoggerModel } from '../models/logger.model';
import { ErrorCreateDto } from '../dtos/error.create.dto';
import { ChlenSubscribersModel } from '../models/chlen-subscribers.model';
import { MailerUtil } from '../../../utils/mailer.util';
// import { ChlenCollectionModel } from "../models/chlen-collection.model";
// import mainConf from "../../../confs/main.conf";

@Injectable()
export class LoggerProvider {
  constructor(
    @InjectModel(LoggerModel) private loggerModel: LoggerModel,
    @Inject(MailerUtil) private mailerUtil: MailerUtil,
  ) {}

  async log(error: ErrorCreateDto): Promise<void> {
    // error.image = await this.sendChlen();
    LoggerModel.create(error).catch((err) => {
      console.log(err);
    });
  }

  getAll(): Promise<LoggerModel[]> {
    return LoggerModel.findAll({
      order: [['id', 'DESC']],
    });
  }

  // private async sendChlen(): Promise<string> {
  //   const subscribers = await this.getAllChlenSubscribers();
  //   const chlenUrl = await this.findNewChlen();
  //   subscribers.map(sub => {
  //     // if (!mainConf.isDev)
  //       // this.mailerUtil.sendChlen(sub.email, chlenUrl);
  //   });
  //   return "https:" + chlenUrl;
  // }

  // private async findNewChlen(): Promise<string> {
  //   const bd = (await ChlenCollectionModel.findAll()).map(el => el.url);
  //   return bd[Math.floor(Math.random() * (bd.length - 1)) + 1]
  // }
  //
  // private async getAllChlenSubscribers(): Promise<ChlenSubscribersModel[]> {
  //   return ChlenSubscribersModel.findAll();
  // }

  async addChlenSubscriber(email: string) {
    await ChlenSubscribersModel.create({
      email: email,
    });
  }
}
