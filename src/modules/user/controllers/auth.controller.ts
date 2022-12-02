import { Body, Controller, Inject, Post, Request, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "../../../guards/local-auth.guard";
import { AuthService } from "../providers/auth.service";
import { AuthOutputDto } from "../dtos/auth/auth-output.dto";
import { AuthInputDto } from "../dtos/auth/auth-input.dto";

@Controller('auth')
export class AuthController {
    constructor(
      @Inject(AuthService) private authService: AuthService
    ) {}

    @Post('/')
    async firstStep(@Body() credentials: AuthInputDto): Promise<AuthOutputDto> {
        return this.authService.firstStep(credentials.email, credentials.password);
    }
    // $2b$10$yCg8bueBdAb5GUwpGNN3QOGKk2zIwEOSuV1zMVF.TaEEbVTK35eDm

    @UseGuards(LocalAuthGuard)
    @Post('/code')
    async secondStep(@Request() req, @Body('code') code: string) {
        return this.authService.login(req.user);
    }
}
