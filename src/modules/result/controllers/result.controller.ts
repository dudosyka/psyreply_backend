import { Body, Controller, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ResultProvider } from "../providers/result.provider";
import { ResultModel } from "../models/result.model";
import { ResultCreateDto } from "../dto/result-create.dto";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { ResultFitlerDto } from "../dto/result-fitler.dto";
import { ResultClientOutputDto } from "../dto/result-client-output.dto";
import { ResultUpdateDto } from "../dto/result-update.dto";
import { AdminGuard } from "../../../guards/admin.guard";

@UseGuards(JwtAuthGuard)
@Controller("result")
export class ResultController {
  constructor(
    @Inject(ResultProvider) private resultProvider: ResultProvider
  ) {
  }

  @Post("/:blockId/pass")
  public async pass(@Req() req, @Param("blockId") blockId: number, @Body() createDto: ResultCreateDto): Promise<ResultModel> {
    return this.resultProvider.pass(req.user.id, blockId, createDto);
  }

  @UseGuards(AdminGuard)
  @Post("/all")
  public async getAll(@Body() filters: ResultFitlerDto): Promise<ResultModel[]> {
    return this.resultProvider.getResults(filters);
  }

  @Post(":userId/all")
  public async getUserResults(@Param("userId") userId: number): Promise<ResultClientOutputDto[]> {
    return this.resultProvider.getResults({ filters: { user_id: userId } });
  }

  @UseGuards(AdminGuard)
  @Patch(":resultId")
  public async update(@Param("resultId") resultId: number, @Body() updateDto: ResultUpdateDto): Promise<ResultModel> {
    return this.resultProvider.update(resultId, updateDto);
  }
}
