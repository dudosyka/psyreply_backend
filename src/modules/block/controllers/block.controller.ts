import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
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

@UseGuards(JwtAuthGuard)
@Controller("block")
export class BlockController {
  constructor(
    @Inject(BlockProvider) private blockProvider: BlockProvider
  ) {
  }

  @UseGuards(AdminGuard)
  @Post("all")
  async getAll(@Body() filter: SearchFilter<BlockFilterDto>): Promise<BlockModel[]> {
    return this.blockProvider.getAll(filter.filters);
  }

  @UseGuards(AdminGuard)
  @Post("hash")
  async createBlockToken(@Body("blockId") blockId: number, @Body("week") week: number): Promise<string> {
    return this.blockProvider.createBlockHash(blockId, week);
  }

  @UseGuards(BlockGuard)
  @Get("assign/:jetBotId/:companyId")
  async assignUserToBlockToken(@Req() req, @Param('jetBotId') jetBotId: number, @Param('companyId') companyId: number): Promise<{ link: string }> {
    const hash = await this.blockProvider.createPassLink(req.user.blockId, req.user.week, jetBotId, companyId);
    return { link: "https://client.psyreply.com/test/" + hash };
  }

  @UseGuards(UserBlockGuard)
  @Get("user")
  async getOneUser(@Req() req): Promise<BlockModel> {
    return await this.blockProvider.getOne(req.user.blockId);
  }

  @UseGuards(AdminGuard)
  @Get(":blockId")
  async getOne(@Param("blockId") blockId: number): Promise<BlockModel> {
    return await this.blockProvider.getOne(blockId);
  }

  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() createDto: BlockCreateDto): Promise<BlockModel> {
    return await this.blockProvider.createModel(createDto);
  }

  @UseGuards(AdminGuard)
  @Delete("")
  async remove(@Body("blocks") blocks: number[]): Promise<boolean> {
    return await this.blockProvider.remove(blocks);
  }

  @UseGuards(AdminGuard)
  @Patch(":blockId")
  async update(@Param("blockId") blockId: number, @Body() updateDto: BlockUpdateDto): Promise<BlockModel> {
    return await this.blockProvider.update(blockId, updateDto);
  }

  @UseGuards(AdminGuard)
  @Post("/copy/:companyId")
  async copyToCompany(@Body("blocks") blocks: number[], @Param("companyId") companyId: number): Promise<BlockModel[] | void> {
    return await this.blockProvider.copyToCompany(blocks, companyId);
  }
}
