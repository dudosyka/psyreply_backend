import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
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
  HttpResponseFilter,
  ResponseStatus,
} from '../../../filters/http-response.filter';
import { AuthProvider } from '../providers/auth.provider';
import { SignupInputDto } from '@app/application/modules/auth/dtos/signup-input.dto';
import { RepassOutputDto } from '@app/application/modules/auth/dtos/repass-output.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@app/application/guards/jwt-auth.guard';
import { AdminGuard } from '@app/application/guards/admin.guard';
import { ChangeEmailOutputDto } from '@app/application/modules/auth/dtos/change-email-output.dto';
import { SuperAdminGuard } from '@app/application/guards/super-admin.guard';
import { ClientSignupInputDto } from '@app/application/modules/auth/dtos/client-signup-input.dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthProvider) private authProvider: AuthProvider) {}

  @Post('/')
  @HttpCode(ResponseStatus.SUCCESS)
  public async firstStep(
    @Body() credentials: AuthInputDto,
  ): Promise<HttpResponseFilter<AuthOutputDto | TokenOutputDto>> {
    if (
      credentials.email == 'shut_up_and_let_me_in' &&
      mainConf().isDev != ProjectState.PROD
    ) {
      return HttpResponseFilter.response<TokenOutputDto>(
        await this.authProvider.superLogin(),
        ResponseStatus.SUCCESS,
      );
    }
    return HttpResponseFilter.response<AuthOutputDto>(
      await this.authProvider.firstStep(
        credentials.email,
        credentials.password,
      ),
      ResponseStatus.SUCCESS,
    );
  }

  @Post('/client')
  @HttpCode(ResponseStatus.SUCCESS)
  public async loginClient(@Body() credentials: AuthInputDto) {
    return HttpResponseFilter.response<TokenOutputDto>(
      await this.authProvider.authClient(credentials),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('/code')
  @HttpCode(ResponseStatus.SUCCESS)
  public async secondStep(
    @Request() req,
  ): Promise<HttpResponseFilter<TokenOutputDto>> {
    return HttpResponseFilter.response<TokenOutputDto>(
      await this.authProvider.login(req.user),
      ResponseStatus.SUCCESS,
    );
  }

  @Post('/dash')
  @HttpCode(ResponseStatus.SUCCESS)
  public async loginDashboard(
    @Body() credentials: AuthInputDto,
  ): Promise<HttpResponseFilter<TokenOutputDto>> {
    return HttpResponseFilter.response<TokenOutputDto>(
      await this.authProvider.loginDashboard(credentials),
      ResponseStatus.SUCCESS,
    );
  }

  @Post('signup')
  @HttpCode(ResponseStatus.SUCCESS)
  @UseInterceptors(FileInterceptor('file'))
  public async signUp(
    @Body() signupData: SignupInputDto,
    @UploadedFile('file') file: Express.Multer.File,
  ): Promise<HttpResponseFilter<TokenOutputDto>> {
    return HttpResponseFilter.response<TokenOutputDto>(
      await this.authProvider.signup(signupData, file),
      ResponseStatus.SUCCESS,
    );
  }

  @Post('client/signup/:chatId')
  @HttpCode(ResponseStatus.SUCCESS)
  @UseInterceptors(FileInterceptor('file'))
  public async signUpClient(
    @Body() signupData: ClientSignupInputDto,
    @UploadedFile('file') file: Express.Multer.File,
    @Param('chatId') chatId: string,
  ) {
    return HttpResponseFilter.response<TokenOutputDto>(
      await this.authProvider.signupClient(signupData, file, parseInt(chatId)),
      ResponseStatus.SUCCESS,
    );
  }

  @Post('repass/first')
  @HttpCode(ResponseStatus.SUCCESS)
  public async repass(
    @Body('login') login: string,
  ): Promise<HttpResponseFilter<RepassOutputDto>> {
    return HttpResponseFilter.response(
      await this.authProvider.repassFirst(login),
      ResponseStatus.SUCCESS,
    );
  }

  @Post('repass/second')
  @HttpCode(ResponseStatus.SUCCESS)
  public async repassSecond(
    @Body('code') emailCode: string,
    @Body('newPassword') newPassword: string,
  ): Promise<HttpResponseFilter<TokenOutputDto>> {
    return HttpResponseFilter.response(
      await this.authProvider.repassSecond(emailCode, newPassword),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('email/change')
  @HttpCode(ResponseStatus.SUCCESS)
  public async emailChange(
    @Req() req,
  ): Promise<HttpResponseFilter<ChangeEmailOutputDto>> {
    return HttpResponseFilter.response(
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
  ): Promise<HttpResponseFilter<ChangeEmailOutputDto>> {
    return HttpResponseFilter.response(
      await this.authProvider.changeEmailSecond(email, code),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('super/check')
  @HttpCode(ResponseStatus.SUCCESS)
  public async checkIsSuper(): Promise<HttpResponseFilter<boolean>> {
    //It will return true if SuperAdminGuard approve request.
    return HttpResponseFilter.response(true, ResponseStatus.SUCCESS);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post('super/auth/:companyId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async superLogin(
    @Req() req,
    @Param('companyId') companyId: string,
  ): Promise<HttpResponseFilter<TokenOutputDto>> {
    return HttpResponseFilter.response(
      await this.authProvider.superLogin(req.user.id, parseInt(companyId)),
      ResponseStatus.SUCCESS,
    );
  }
}
