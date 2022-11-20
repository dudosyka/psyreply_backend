import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {UserModel} from "./models/user.model";

@Module({
  imports: [SequelizeModule.forFeature([UserModel])],
  controllers: [UserController]
})
export class UserModule {}
