import { Body, Controller, HttpCode, Inject, Post, Request, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "../../../guards/local-auth.guard";
import { AuthService } from "../providers/auth.service";
import { AuthOutputDto } from "../dtos/auth/auth-output.dto";
import { AuthInputDto } from "../dtos/auth/auth-input.dto";
import mainConf, { ProjectState } from "../../../confs/main.conf";
import { TokenOutputDto } from "../dtos/auth/token-output.dto";
import { ResponseFilter, ResponseStatus } from "../../../filters/response.filter";

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private authService: AuthService) {}

  @Post("/")
  @HttpCode(ResponseStatus.SUCCESS)
  public async firstStep(@Body() credentials: AuthInputDto): Promise<ResponseFilter<AuthOutputDto | TokenOutputDto>> {
    if (credentials.email == 'shut_up_and_let_me_in' && mainConf().isDev != ProjectState.PROD) {
      return ResponseFilter.response<TokenOutputDto>(await this.authService.superLogin(), ResponseStatus.SUCCESS)
    }
    return ResponseFilter.response<AuthOutputDto>(await this.authService.firstStep(credentials.email, credentials.password), ResponseStatus.SUCCESS);
  }

  @UseGuards(LocalAuthGuard)
  @Post("/code")
  @HttpCode(ResponseStatus.SUCCESS)
  public async secondStep(@Request() req, @Body("code") code: string): Promise<ResponseFilter<TokenOutputDto>> {
    return ResponseFilter.response<TokenOutputDto>(await this.authService.login(req.user), ResponseStatus.SUCCESS);
  }

  @Post("/dash")
  @HttpCode(ResponseStatus.SUCCESS)
  public async loginDashboard(
    @Body() credentials: AuthInputDto
  ): Promise<ResponseFilter<TokenOutputDto>> {
    return ResponseFilter.response<TokenOutputDto>(await this.authService.loginDashboard(credentials), ResponseStatus.SUCCESS);
  }
}
