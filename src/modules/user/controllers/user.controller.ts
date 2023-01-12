import { Body, Controller, Get, Inject, Param, Post, Req, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { UserProvider } from "../providers/user.provider";
import { AuthService } from "../providers/auth.service";
import { UserBlockGuard } from "../../../guards/user-block.guard";
import { UserFilterDto } from "../dtos/user-filter.dto";
import { UserModel } from "../models/user.model";
import { BlockGuard } from "../../../guards/block.guard";
import { ResponseFilter, ResponseStatus } from "../../../filters/response.filter";

@Controller("user")
export class UserController {

  constructor(
    @Inject(UserProvider) private userProvider: UserProvider,
    @Inject(AuthService) private authService: AuthService
  ) {
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  get(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('/all')
  public async getAll(@Req() req, @Body() filter: UserFilterDto): Promise<ResponseFilter<UserModel[]>> {
    return ResponseFilter.response<UserModel[]>(await this.userProvider.getAll(filter), ResponseStatus.SUCCESS);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get(':jbId/assign')
  public async assignUser(@Param('jbId') userId: number): Promise<ResponseFilter<string>> {
    return ResponseFilter.response<string>(`https://client.psyreply.com/results/${await this.authService.assignUser(userId)}`, ResponseStatus.SUCCESS);
  }

  @UseGuards(JwtAuthGuard, BlockGuard)
  @Get('/client/:jbId/assign')
  public async assignUserFromBot(@Param('jbId') jetBotId: number): Promise<{ link2: string }> {
    return {
      link2: `https://client.psyreply.com/results/${await this.authService.assignUser(jetBotId)}`
    }
  }


  @UseGuards(JwtAuthGuard, UserBlockGuard)
  @Get('/assign')
  public async assignUserByUserBlockToken(@Req() req) {
    return `https://client.psyreply.com/results/${await this.authService.assignUserByUserBlock(req.user.id)}`;
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(":userId/move/:companyId")
  moveToCompany(@Param("userId") userId: number, @Param("companyId") companyId: number): Promise<boolean> {
    return this.userProvider.moveToCompany(userId, companyId);
  }
}
