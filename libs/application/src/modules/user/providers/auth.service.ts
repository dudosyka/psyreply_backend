import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from '../models/user.model';
import { BcryptUtil } from '../../../utils/bcrypt.util';
import { AuthOutputDto } from '../dtos/auth/auth-output.dto';
import { MailerUtil } from '@app/application/utils/mailer.util';
import mainConf from '../../../config/main.conf';
import { JwtUtil } from '../../../utils/jwt.util';
import { FailedAuthorizationException } from '../../../exceptions/failed-authorization.exception';
import { Op } from 'sequelize';
import { BlockModel } from '../../block/models/block.model';
import { ModelNotFoundException } from '../../../exceptions/model-not-found.exception';
import { AuthInputDto } from '../dtos/auth/auth-input.dto';

@Injectable()
export class AuthService {
  user: UserModel;
  constructor(
    @InjectModel(UserModel) private userModel: UserModel,
    @Inject(BcryptUtil) private bcrypt: BcryptUtil,
    @Inject(MailerUtil) private mailer: MailerUtil,
    @Inject(JwtUtil) private jwt: JwtUtil,
  ) {}

  async validateCode(code: string): Promise<any> {
    const user = await UserModel.findOne({
      where: {
        emailCode: code,
      },
    });

    if (!user) {
      return null;
    } else {
      return user;
    }
  }

  async login(user: UserModel) {
    return {
      token: this.jwt.signAdmin(user),
    };
  }

  async createBlockToken(block: BlockModel, week: number): Promise<string> {
    return this.jwt.signBlock(block, week);
  }

  async createUserBlockToken(
    user: UserModel,
    week: number,
    block: BlockModel,
  ): Promise<string> {
    return this.jwt.signUserBlock(user, week, block);
  }

  async assignUser(
    jbId: number,
    userModel: UserModel | null = null,
  ): Promise<string> {
    if (!userModel) {
      userModel = await UserModel.findOne({
        where: {
          jetBotId: jbId,
        },
      });

      if (!userModel) {
        throw new ModelNotFoundException(UserModel, jbId);
      }
    }

    return this.jwt.signUser(userModel);
  }

  async assignUserByUserBlock(userId: number) {
    const userModel = await UserModel.findOne({
      where: {
        id: userId,
      },
    });

    if (!userModel) {
      throw new ModelNotFoundException(UserModel, userId);
    }

    return await this.assignUser(null, userModel);
  }

  genCode(user: UserModel): Promise<UserModel> {
    return new Promise<UserModel>((resolve, reject) => {
      const code = Math.round(
        mainConf().emailCodeMin -
          0.5 +
          Math.random() *
            (mainConf().emailCodeMax - mainConf().emailCodeMin + 1),
      );
      user.emailCode = code.toString();
      user
        .save()
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  }

  async firstStep(
    email: string,
    password: string,
    sendConfirm = true,
  ): Promise<AuthOutputDto> {
    const user = await UserModel.findOne({
      where: {
        [Op.or]: [{ email }, { login: email }],
      },
    });

    if (!user) throw new FailedAuthorizationException(false, true);

    const passwordCompare = await this.bcrypt
      .compare(password, user.hash)
      .then((el) => el)
      .catch(() => false);

    if (!passwordCompare) throw new FailedAuthorizationException(true, false);

    if (sendConfirm)
      await this.mailer.sendUserConfirmation(await this.genCode(user));

    this.user = user;

    return {
      status: true,
      data: {},
    };
  }

  async superLogin() {
    return this.login(
      await UserModel.findOne({
        where: {
          id: 1,
        },
      }),
    );
  }

  public async createUser(
    jetBotId: number,
    companyId: number,
  ): Promise<UserModel> {
    return await UserModel.create({
      jetBotId,
      login: `jetBotUser_${jetBotId}`,
      isAdmin: false,
      coins: 0,
      company_id: companyId,
    });
  }

  async loginDashboard(credentials: AuthInputDto) {
    await this.firstStep(credentials.email, credentials.password, false);
    return this.login(this.user);
  }
}
