import {Inject, Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/sequelize";
import {UserModel} from "../models/user.model";
import {BcryptUtil} from "../../../utils/bcrypt.util";
import {FirstStepOutput} from "../dtos/auth/first.step.output";
import {MailerUtil} from "../../../utils/mailer.util";
import mainConf from "../../../confs/main.conf";
import {TokenOutput} from "../dtos/auth/token.output";
import {JwtUtil} from "../../../utils/jwt.util";

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(UserModel) private userModel: UserModel,
        @Inject(BcryptUtil) private bcrypt: BcryptUtil,
        @Inject(MailerUtil) private mailer: MailerUtil,
        @Inject(JwtUtil) private jwt: JwtUtil,
    ) {
    }

    genCode(user: UserModel): Promise<UserModel> {
        return new Promise<UserModel>((resolve, reject) => {
            const code = mainConf.emailCode.min - 0.5 + Math.random() * (mainConf.emailCode.max - mainConf.emailCode.min + 1)
            user.emailCode = code.toString();
            user.save().then(res => resolve(res)).catch(err => reject(err));
        });
    }

    async firstStep(login: string, password: string): Promise<FirstStepOutput> {
        let user = await UserModel.findOne({
            where: {
                login: login
            }
        })

        if (!user)
            return {
                status: false,
                data: {
                    email: false,
                }
            };

        const passwordCompare = await this.bcrypt.compare(password, user.hash).then(el => el).catch(() => false);

        if (!passwordCompare)
            return {
                status: false,
                data: {
                    password: false
                }
            }

        await this.genCode(user);

        return {
            status: true,
            data: {}
        };
    }

    async secondStep(code: string): Promise<TokenOutput | boolean> {
        const user = await UserModel.findOne({
            where: {
                emailCode: code
            }
        });

        if (!user)
            return false;
        else
            return {
                token: this.jwt.sign(user)
            };
    }
}
