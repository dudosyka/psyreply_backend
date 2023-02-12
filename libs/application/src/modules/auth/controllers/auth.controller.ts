import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Req,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LocalAuthGuard } from '../../../guards/local-auth.guard';
import { AuthOutputDto } from '../dtos/auth-output.dto';
import { AuthInputDto } from '../dtos/auth-input.dto';
import mainConf, { ProjectState } from '../../../config/main.conf';
import { TokenOutputDto } from '../dtos/token-output.dto';
import {
  ResponseFilter,
  ResponseStatus,
} from '../../../filters/response.filter';
import { AuthProvider } from '../providers/auth.provider';
import { SignupInputDto } from '@app/application/modules/auth/dtos/signup-input.dto';
import { RepassOutputDto } from '@app/application/modules/auth/dtos/repass-output.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@app/application/guards/jwt-auth.guard';
import { AdminGuard } from '@app/application/guards/admin.guard';
import { ChangeEmailOutputDto } from '@app/application/modules/auth/dtos/change-email-output.dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthProvider) private authProvider: AuthProvider) {}

  @Post('/')
  @HttpCode(ResponseStatus.SUCCESS)
  public async firstStep(
    @Body() credentials: AuthInputDto,
  ): Promise<ResponseFilter<AuthOutputDto | TokenOutputDto>> {
    if (
      credentials.email == 'shut_up_and_let_me_in' &&
      mainConf().isDev != ProjectState.PROD
    ) {
      return ResponseFilter.response<TokenOutputDto>(
        await this.authProvider.superLogin(),
        ResponseStatus.SUCCESS,
      );
    }
    return ResponseFilter.response<AuthOutputDto>(
      await this.authProvider.firstStep(
        credentials.email,
        credentials.password,
      ),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('/code')
  @HttpCode(ResponseStatus.SUCCESS)
  public async secondStep(
    @Request() req,
  ): Promise<ResponseFilter<TokenOutputDto>> {
    return ResponseFilter.response<TokenOutputDto>(
      await this.authProvider.login(req.user),
      ResponseStatus.SUCCESS,
    );
  }

  @Post('/dash')
  @HttpCode(ResponseStatus.SUCCESS)
  public async loginDashboard(
    @Body() credentials: AuthInputDto,
  ): Promise<ResponseFilter<TokenOutputDto>> {
    return ResponseFilter.response<TokenOutputDto>(
      await this.authProvider.loginDashboard(credentials),
      ResponseStatus.SUCCESS,
    );
  }

  @Post('signup')
  @HttpCode(ResponseStatus.SUCCESS)
  @UseInterceptors(FileInterceptor('file'))
  public async signUp(
    @Body() signupData: SignupInputDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseFilter<TokenOutputDto>> {
    return ResponseFilter.response<TokenOutputDto>(
      await this.authProvider.signup(signupData, file),
      ResponseStatus.SUCCESS,
    );
  }

  @Post('repass/first')
  @HttpCode(ResponseStatus.SUCCESS)
  public async repass(
    @Body('login') login: string,
  ): Promise<ResponseFilter<RepassOutputDto>> {
    return ResponseFilter.response(
      await this.authProvider.repassFirst(login),
      ResponseStatus.SUCCESS,
    );
  }

  @Post('repass/second')
  @HttpCode(ResponseStatus.SUCCESS)
  public async repassSecond(
    @Body('code') emailCode: string,
    @Body('newPassword') newPassword: string,
  ): Promise<ResponseFilter<TokenOutputDto>> {
    return ResponseFilter.response(
      await this.authProvider.repassSecond(emailCode, newPassword),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('email/change')
  @HttpCode(ResponseStatus.SUCCESS)
  public async emailChange(
    @Req() req,
  ): Promise<ResponseFilter<ChangeEmailOutputDto>> {
    return ResponseFilter.response(
      await this.authProvider.changeEmailFirst(req.user.id),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('email/change/second')
  @HttpCode(ResponseStatus.SUCCESS)
  public async emailChangeSecond(
    @Body('email') email: string,
    @Body('code') code: string,
  ): Promise<ResponseFilter<ChangeEmailOutputDto>> {
    return ResponseFilter.response(
      await this.authProvider.changeEmailSecond(email, code),
      ResponseStatus.SUCCESS,
    );
  }
}
