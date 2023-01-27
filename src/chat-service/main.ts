import {TelegramListener} from "./listener";
import { BotModel } from "../modules/bot/models/bot.model";
import { Sequelize } from "sequelize-typescript";
import mainConf, { ProjectState } from "../confs/main.conf";
import { BotUserModel } from "../modules/bot/models/bot-user.model";
import { MessageModel } from "../modules/bot/models/message.model";
import { MessageTypeModel } from "../modules/bot/models/message-type.model";
import { UserMessageModel } from "../modules/bot/models/user-message.model";
import { UserModel } from "../modules/user/models/user.model";
import { CompanyModel } from "../modules/company/models/company.model";
import { GroupModel } from "../modules/company/models/group.model";
import { BlockModel } from "../modules/block/models/block.model";
import { TestModel } from "../modules/test/models/test.model";
import { TestBlockModel } from "../modules/test-block/models/test-block.model";
import { QuestionTypeModel } from "../modules/question-type/models/question-type.model";
import { MetricModel } from "../modules/metric/models/metric.model";
import { QuestionModel } from "../modules/question/models/question.model";


let db_conf: any = mainConf.db.dev;
if (mainConf.isDev == ProjectState.TEST_PROD)
  db_conf = mainConf.db.test_prod;
else if (mainConf.isDev == ProjectState.PROD)
  db_conf = mainConf.db.prod;

const sequelize = new Sequelize({
  dialect: 'mysql',
  ...db_conf,
  autoLoadModels: true,
});
sequelize.addModels([
  GroupModel,
  BlockModel,
  TestBlockModel,
  TestModel,
  QuestionTypeModel,
  MetricModel,
  QuestionModel,

  CompanyModel,
  UserModel,
  BotModel,
  BotUserModel,
  MessageModel,
  MessageTypeModel,
  UserMessageModel
])

BotModel.findAll().then(bots => {
  bots.map(bot => {
    const tl = new TelegramListener(bot.token, sequelize);
    console.log(bot.name, "processing...")
    tl.launch();
  })
})
