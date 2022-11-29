import { Body, Controller, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ResultProvider } from "../providers/result.provider";
import { ResultModel } from "../models/result.model";
import { ResultCreateDto } from "../dto/result-create.dto";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('result')
export class ResultController {
  constructor(
    @Inject(ResultProvider) private resultProvider: ResultProvider
  ) {}

  @Post('/:blockId/pass')
  public async pass(@Req() req, @Param('blockId') blockId: number, @Body() createDto: ResultCreateDto): Promise<ResultModel> {
    return this.resultProvider.pass(req.user.id, blockId, createDto);
  }
}
