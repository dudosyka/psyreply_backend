import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from '@app/application/modules/user/models/user.model';
import { BcryptUtil } from '@app/application/utils/bcrypt.util';
import { AuthOutputDto } from '@app/application/modules/user/dtos/auth/auth-output.dto';
import { MailerUtil } from '@app/application/utils/mailer.util';
import mainConf from '@app/application/config/main.conf';
import { JwtUtil } from '@app/application/utils/jwt.util';
import { FailedAuthorizationException } from '@app/application/exceptions/failed-authorization.exception';
import { Op } from 'sequelize';
import { BlockModel } from '@app/application/modules/block/models/block.model';
import { ModelNotFoundException } from '@app/application/exceptions/model-not-found.exception';
import { AuthInputDto } from '@app/application/modules/user/dtos/auth/auth-input.dto';
import { RepassOutputDto } from '@app/application/modules/auth/dtos/repass-output.dto';
import { SignupInputDto } from '@app/application/modules/auth/dtos/signup-input.dto';
import { DoubleRecordException } from '@app/application/exceptions/double-record.exception';
import { TokenOutputDto } from '@app/application/modules/auth/dtos/token-output.dto';
import { CompanyModel } from '@app/application/modules/company/models/company.model';
import { TransactionUtil } from '@app/application/utils/TransactionUtil';
import { Sequelize } from 'sequelize-typescript';
import { ChangeEmailOutputDto } from '@app/application/modules/auth/dtos/change-email-output.dto';

@Injectable()
export class AuthProvider {
  user: UserModel;
  constructor(
    @InjectModel(UserModel) private userModel: UserModel,
    @Inject(BcryptUtil) private bcrypt: BcryptUtil,
    @Inject(MailerUtil) private mailer: MailerUtil,
    @Inject(JwtUtil) private jwt: JwtUtil,
    private sequelize: Sequelize,
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

  async login(user: UserModel): Promise<TokenOutputDto> {
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

  async createShareDashboardToken(
    sharedGroups: number[],
    companyId: number,
  ): Promise<string> {
    return this.jwt.shareDashboard(sharedGroups, companyId);
  }

  async signDashboard(companyId: number): Promise<string> {
    return this.jwt.signDashboard(companyId);
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

  async superLogin(userId: number = null, companyId: number = null) {
    if (!userId)
      return this.login(
        await UserModel.findOne({
          where: {
            login: 'dudosyka',
          },
        }),
      );
    const user = await UserModel.findOne({
      where: {
        id: userId,
      },
    });
    user.company_id = companyId;
    return await this.login(user);
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
    return { token: await this.signDashboard(this.user.company_id) };
  }

  async signup(
    signupData: SignupInputDto,
    file: Express.Multer.File,
  ): Promise<TokenOutputDto> {
    TransactionUtil.setHost(await this.sequelize.transaction());

    const checkUnique = await UserModel.findOne({
      where: {
        [Op.or]: [{ email: signupData.email }, { login: signupData.login }],
      },
    });

    if (checkUnique) throw new DoubleRecordException(UserModel);

    const company = await CompanyModel.create(
      {
        name: signupData.companyName,
        logo: file.filename,
      },
      TransactionUtil.getHost(),
    )
      .then((res) => {
        if (!res) {
          TransactionUtil.rollback();
          throw new Error('Company model creation failed!');
        }
        return res;
      })
      .catch((err) => {
        TransactionUtil.rollback();
        throw err;
      });

    const user = await UserModel.create(
      {
        jetBotId: null,
        login: signupData.login,
        hash: await this.bcrypt.hash(signupData.password),
        email: signupData.email,
        isAdmin: 1,
        company_id: company.id,
      },
      TransactionUtil.getHost(),
    )
      .then((res) => {
        if (!res) {
          TransactionUtil.rollback();
          throw new Error('User model creation failed!');
        }
        return res;
      })
      .catch((err) => {
        TransactionUtil.rollback();
        throw err;
      });

    await TransactionUtil.commit();

    return await this.login(user);
  }

  async repassFirst(login: string): Promise<RepassOutputDto> {
    const checkExists = await UserModel.findOne({
      where: {
        [Op.or]: [{ email: login }, { login }],
      },
    });

    if (!checkExists) throw new ModelNotFoundException(UserModel, null);

    await this.mailer.sendUserConfirmation(checkExists);

    return {
      success: true,
    };
  }

  async repassSecond(
    emailCode: string,
    newPassword: string,
  ): Promise<TokenOutputDto> {
    const user = await UserModel.findOne({
      where: {
        emailCode,
      },
    });

    if (!user) throw new ModelNotFoundException(UserModel, null);

    await user.update({
      hash: await this.bcrypt.hash(newPassword),
    });

    return await this.login(user);
  }

  async changeEmailFirst(id: number): Promise<ChangeEmailOutputDto> {
    const checkExists = await UserModel.findOne({
      where: {
        id,
      },
    });

    if (!checkExists) throw new ModelNotFoundException(UserModel, null);

    await this.mailer.sendUserConfirmation(checkExists);

    return { success: true };
  }

  async changeEmailSecond(
    newEmail: string,
    emailCode: string,
  ): Promise<ChangeEmailOutputDto> {
    const user = await UserModel.findOne({
      where: {
        emailCode,
      },
    });

    const checkExists = await UserModel.findOne({
      where: {
        [Op.or]: [{ email: newEmail }],
      },
    });

    if (!checkExists) throw new ModelNotFoundException(UserModel, null);

    await user.update({
      email: newEmail,
    });

    return { success: true };
  }

  async checkIsSuper(user): Promise<boolean> {
    console.log(user);
    return false;
  }
}
