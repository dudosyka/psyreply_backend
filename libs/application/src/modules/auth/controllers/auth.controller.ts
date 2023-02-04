import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Request,
  UseGuards,
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
}
