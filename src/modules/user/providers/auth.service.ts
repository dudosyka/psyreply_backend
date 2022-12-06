import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UserModel } from "../models/user.model";
import { BcryptUtil } from "../../../utils/bcrypt.util";
import { AuthOutputDto } from "../dtos/auth/auth-output.dto";
import { MailerUtil } from "../../../utils/mailer.util";
import mainConf from "../../../confs/main.conf";
import { JwtUtil } from "../../../utils/jwt.util";
import { FailedAuthorizationException } from "../../../exceptions/failed-authorization.exception";
import { Op } from "sequelize";
import { BlockModel } from "../../block/models/block.model";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel) private userModel: UserModel,
    @Inject(BcryptUtil) private bcrypt: BcryptUtil,
    @Inject(MailerUtil) private mailer: MailerUtil,
    @Inject(JwtUtil) private jwt: JwtUtil
  ) {
  }

  async validateCode(code: string): Promise<any> {
    const user = await UserModel.findOne({
      where: {
        emailCode: code
      }
    });

    if (!user) {
      return null;
    } else {
      return user;
    }
  }

  async login(user: UserModel) {
    return {
      token: this.jwt.signAdmin(user)
    };
  }

  async createBlockToken(block: BlockModel): Promise<string> {
    return this.jwt.signBlock(block)
  }

  async createUserBlockToken(user: UserModel, block: BlockModel): Promise<string> {
    return this.jwt.signUserBlock(user, block);
  }

  genCode(user: UserModel): Promise<UserModel> {
    return new Promise<UserModel>((resolve, reject) => {
      const code = Math.round(mainConf.emailCode.min - 0.5 + Math.random() * (mainConf.emailCode.max - mainConf.emailCode.min + 1));
      user.emailCode = code.toString();
      user.save().then(res => resolve(res)).catch(err => reject(err));
    });
  }

  async firstStep(email: string, password: string): Promise<AuthOutputDto> {
    let user = await UserModel.findOne({
      where: {
        [Op.or]: [{ email }, { login: email }]
      }
    });

    if (!user)
      throw new FailedAuthorizationException(false, true);

    const passwordCompare = await this.bcrypt.compare(password, user.hash).then(el => el).catch(() => false);

    if (!passwordCompare)
      throw new FailedAuthorizationException(true, false);

    await this.mailer.sendUserConfirmation((await this.genCode(user)));


    return {
      status: true,
      data: {}
    };
  }

}
