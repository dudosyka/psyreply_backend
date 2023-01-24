import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { AdminGuard } from "../../../guards/admin.guard";
import { BlockProvider } from "../providers/block.provider";
import { BlockModel } from "../models/block.model";
import { BlockFilterDto } from "../dtos/block-filter.dto";
import { BlockCreateDto } from "../dtos/block-create.dto";
import { BlockUpdateDto } from "../dtos/block-update.dto";
import { SearchFilter } from "../../../filters/search.filter";
import { BlockGuard } from "../../../guards/block.guard";
import { UserBlockGuard } from "../../../guards/user-block.guard";
import { AuthService } from "../../user/providers/auth.service";
import { ResponseFilter, ResponseStatus } from "../../../filters/response.filter";

@UseGuards(JwtAuthGuard)
@Controller('block')
export class BlockController {
  constructor(
    @Inject(BlockProvider) private blockProvider: BlockProvider,
    @Inject(AuthService) private authService: AuthService,
  ) {}

  @UseGuards(AdminGuard)
  @Post("all")
  @HttpCode(ResponseStatus.SUCCESS)
  public async getAll(@Body() filter: SearchFilter<BlockFilterDto>): Promise<ResponseFilter<BlockModel[]>> {
    return ResponseFilter.response<BlockModel[]>(await this.blockProvider.getAll(filter.filters), ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Post("hash")
  @HttpCode(ResponseStatus.CREATED)
  public async createBlockToken(@Body("blockId") blockId: number, @Body("week") week: number): Promise<ResponseFilter<string>> {
    return ResponseFilter.response<string>(await this.blockProvider.createBlockHash(blockId, week), ResponseStatus.CREATED);
  }

  @UseGuards(BlockGuard)
  @Get("assign/:jetBotId")
  @HttpCode(ResponseStatus.SUCCESS)
  public async assignUserToBlockToken(@Req() req, @Param('jetBotId') jetBotId: number): Promise<ResponseFilter<{ link: string, linkdb: string }>> {
    return ResponseFilter.response<{ link: string, linkdb: string }>(await this.blockProvider.createLinks(req.user, jetBotId), ResponseStatus.SUCCESS);
  }

  @UseGuards(UserBlockGuard)
  @Get("user")
  @HttpCode(ResponseStatus.SUCCESS)
  public async getOneUser(@Req() req): Promise<ResponseFilter<BlockModel>> {
    return ResponseFilter.response<BlockModel>(await this.blockProvider.getOne(req.user.blockId), ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Get(":blockId")
  @HttpCode(ResponseStatus.SUCCESS)
  public async getOne(@Param("blockId") blockId: number): Promise<ResponseFilter<BlockModel>> {
    return ResponseFilter.response<BlockModel>(await this.blockProvider.getOne(blockId), ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Post()
  @HttpCode(ResponseStatus.CREATED)
  public async create(@Body() createDto: BlockCreateDto): Promise<ResponseFilter<BlockModel>> {
    return ResponseFilter.response<BlockModel>(await this.blockProvider.createModel(createDto), ResponseStatus.CREATED);
  }

  @UseGuards(AdminGuard)
  @Delete("")
  @HttpCode(ResponseStatus.NO_CONTENT)
  public async remove(@Body("blocks") blocks: number[]): Promise<ResponseFilter<null>> {
    await this.blockProvider.remove(blocks);
    return ResponseFilter.response<null>(null, ResponseStatus.NO_CONTENT);
  }

  @UseGuards(AdminGuard)
  @Patch(":blockId")
  @HttpCode(ResponseStatus.SUCCESS)
  public async update(@Param("blockId") blockId: number, @Body() updateDto: BlockUpdateDto): Promise<ResponseFilter<BlockModel>> {
    return ResponseFilter.response<BlockModel>(await this.blockProvider.update(blockId, updateDto), ResponseStatus.SUCCESS);
  }

  @UseGuards(AdminGuard)
  @Post("/copy/:companyId")
  @HttpCode(ResponseStatus.SUCCESS)
  public async copyToCompany(@Body("blocks") blocks: number[], @Param("companyId") companyId: number): Promise<ResponseFilter<BlockModel[] | void>> {
    return ResponseFilter.response<BlockModel[] | void>(await this.blockProvider.copyToCompany(blocks, companyId), ResponseStatus.SUCCESS);
  }
}
