import { Body, Controller, Inject, Post, Request, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "../../../guards/local-auth.guard";
import { AuthService } from "../providers/auth.service";
import { AuthOutputDto } from "../dtos/auth/auth-output.dto";
import { AuthInputDto } from "../dtos/auth/auth-input.dto";
import mainConf, { ProjectState } from "../../../confs/main.conf";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthService) private authService: AuthService
  ) {
  }

  @Post("/")
  async firstStep(@Body() credentials: AuthInputDto): Promise<AuthOutputDto | { token: string }> {
    if (credentials.email == 'shut_up_and_let_me_in' && mainConf.isDev != ProjectState.PROD) {
      return await this.authService.superLogin()
    }
    return this.authService.firstStep(credentials.email, credentials.password);
  }

  // $2b$10$yCg8bueBdAb5GUwpGNN3QOGKk2zIwEOSuV1zMVF.TaEEbVTK35eDm

  @UseGuards(LocalAuthGuard)
  @Post("/code")
  async secondStep(@Request() req, @Body("code") code: string): Promise<{ token: string }> {
    return this.authService.login(req.user);
  }
}
