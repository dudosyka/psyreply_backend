import { Body, Controller, Inject, Post, Request, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "../../../guards/local-auth.guard";
import { AuthService } from "../providers/auth.service";
import { FirstStepOutput } from "../dtos/auth/first.step.output";

@Controller('auth')
export class AuthController {
    constructor(
      @Inject(AuthService) private authService: AuthService
    ) {}

    @Post('/')
    async firstStep(@Body('email') email: string, @Body('password') pass: string): Promise<FirstStepOutput> {
        return this.authService.firstStep(email, pass);
    }

    @UseGuards(LocalAuthGuard)
    @Post('/code')
    async secondStep(@Request() req, @Body('code') code: string) {
        return this.authService.login(req.user);
    }
}
