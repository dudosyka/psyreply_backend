import { Module } from "@nestjs/common";
import { BlockController } from "./controllers/block.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { BlockModel } from "./models/block.model";
import { BlockProvider } from "./providers/block.provider";
import { TestBlockModule } from "../test-block/test-block.module";
import { AuthService } from "../user/providers/auth.service";
import { UserModel } from "../user/models/user.model";
import { BcryptUtil } from "../../utils/bcrypt.util";
import { MailerUtil } from "../../utils/mailer.util";
import { JwtUtil } from "../../utils/jwt.util";
import { JwtModule } from "@nestjs/jwt";
import mainConf from "../../confs/main.conf";

@Module({
  imports: [
    SequelizeModule.forFeature([BlockModel, UserModel]),
    TestBlockModule,
    JwtModule.register({
      secret: mainConf.jwtConstants.secret,
      signOptions: { expiresIn: "100d" }
    }),
  ],
  controllers: [BlockController],
  providers: [BlockProvider, AuthService, BcryptUtil, MailerUtil, JwtUtil],
  exports: [TestBlockModule, BlockProvider, SequelizeModule.forFeature([BlockModel]), AuthService]
})
export class BlockModule {
}
