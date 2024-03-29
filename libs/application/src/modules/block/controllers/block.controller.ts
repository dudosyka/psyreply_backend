import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { AdminGuard } from '../../../guards/admin.guard';
import { BlockProvider } from '../providers/block.provider';
import { BlockModel } from '../models/block.model';
import { BlockFilterDto } from '../dtos/block-filter.dto';
import { BlockCreateDto } from '../dtos/block-create.dto';
import { BlockUpdateDto } from '../dtos/block-update.dto';
import { SearchFilter } from '../../../filters/search.filter';
import { BlockGuard } from '../../../guards/block.guard';
import { UserBlockGuard } from '../../../guards/user-block.guard';
import { AuthProvider } from '@app/application/modules/auth/providers/auth.provider';
import {
  HttpResponseFilter,
  ResponseStatus,
} from '../../../filters/http-response.filter';
import { BlockGroupStatOutputDto } from '../../result/dto/block-stat-output.dto';
import { SuperAdminGuard } from '../../../guards/super-admin.guard';
import { GroupBlockStatModel } from '@app/application/modules/result/models/group-block-stat.model';

@UseGuards(JwtAuthGuard)
@Controller('block')
export class BlockController {
  constructor(
    @Inject(BlockProvider) private blockProvider: BlockProvider,
    @Inject(AuthProvider) private authProvider: AuthProvider,
  ) {}

  @UseGuards(AdminGuard)
  @Post('/all')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getAll(
    @Body() filter: SearchFilter<BlockFilterDto>,
    @Req() req,
  ): Promise<HttpResponseFilter<BlockModel[]>> {
    filter.filters.company_id = req.user.companyId;
    return HttpResponseFilter.response<BlockModel[]>(
      await this.blockProvider.getAll(filter.filters),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Post('/super/all')
  @HttpCode(ResponseStatus.SUCCESS)
  public async superGetAll(
    @Body() filter: SearchFilter<BlockFilterDto>,
  ): Promise<HttpResponseFilter<BlockModel[]>> {
    return HttpResponseFilter.response<BlockModel[]>(
      await this.blockProvider.getAll(filter.filters),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(AdminGuard)
  @Post('hash')
  @HttpCode(ResponseStatus.CREATED)
  public async createBlockToken(
    @Body('blockId') blockId: number,
    @Body('week') week: number,
    @Req() req,
  ): Promise<HttpResponseFilter<string>> {
    return HttpResponseFilter.response<string>(
      await this.blockProvider.createBlockHash(
        blockId,
        week,
        req.user.companyId,
      ),
      ResponseStatus.CREATED,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Post('/super/hash')
  @HttpCode(ResponseStatus.CREATED)
  public async superCreateBlockToken(
    @Body('blockId') blockId: number,
    @Body('week') week: number,
  ): Promise<HttpResponseFilter<string>> {
    return HttpResponseFilter.response<string>(
      await this.blockProvider.createBlockHash(blockId, week),
      ResponseStatus.CREATED,
    );
  }

  @UseGuards(BlockGuard)
  @Get('assign/:jetBotId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async assignUserToBlockToken(
    @Req() req,
    @Param('jetBotId') jetBotId: number,
  ): Promise<HttpResponseFilter<{ link: string; linkdb: string }>> {
    return HttpResponseFilter.response<{ link: string; linkdb: string }>(
      await this.blockProvider.createLinks(req.user, jetBotId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(UserBlockGuard)
  @Get('user')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getOneUser(@Req() req): Promise<HttpResponseFilter<BlockModel>> {
    return HttpResponseFilter.response<BlockModel>(
      await this.blockProvider.getOne(req.user.blockId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(AdminGuard)
  @Get(':blockId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getOne(
    @Param('blockId') blockId: number,
    @Req() req,
  ): Promise<HttpResponseFilter<BlockModel>> {
    return HttpResponseFilter.response<BlockModel>(
      await this.blockProvider.getOne(blockId, null, req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Get('/super/:blockId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async superGetOne(
    @Param('blockId') blockId: number,
  ): Promise<HttpResponseFilter<BlockModel>> {
    return HttpResponseFilter.response<BlockModel>(
      await this.blockProvider.getOne(blockId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(AdminGuard)
  @Post()
  @HttpCode(ResponseStatus.CREATED)
  public async create(
    @Body() createDto: BlockCreateDto,
    @Req() req,
  ): Promise<HttpResponseFilter<BlockModel>> {
    createDto.company_id = req.user.companyId;
    return HttpResponseFilter.response<BlockModel>(
      await this.blockProvider.createModel(createDto),
      ResponseStatus.CREATED,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Post('/super/create')
  @HttpCode(ResponseStatus.CREATED)
  public async superCreate(
    @Body() createDto: BlockCreateDto,
  ): Promise<HttpResponseFilter<BlockModel>> {
    return HttpResponseFilter.response<BlockModel>(
      await this.blockProvider.createModel(createDto),
      ResponseStatus.CREATED,
    );
  }

  @UseGuards(AdminGuard)
  @Delete('')
  @HttpCode(ResponseStatus.NO_CONTENT)
  public async remove(
    @Body('blocks') blocks: number[],
    @Req() req,
  ): Promise<HttpResponseFilter<null>> {
    await this.blockProvider.remove(blocks, req.user.companyId);
    return HttpResponseFilter.response<null>(null, ResponseStatus.NO_CONTENT);
  }

  @UseGuards(SuperAdminGuard)
  @Delete('/super')
  @HttpCode(ResponseStatus.NO_CONTENT)
  public async superRemove(
    @Body('blocks') blocks: number[],
  ): Promise<HttpResponseFilter<null>> {
    await this.blockProvider.remove(blocks);
    return HttpResponseFilter.response<null>(null, ResponseStatus.NO_CONTENT);
  }

  @UseGuards(AdminGuard)
  @Patch(':blockId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async update(
    @Param('blockId') blockId: number,
    @Body() updateDto: BlockUpdateDto,
    @Req() req,
  ): Promise<HttpResponseFilter<BlockModel>> {
    return HttpResponseFilter.response<BlockModel>(
      await this.blockProvider.update(blockId, updateDto, req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Patch('/super/:blockId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async updateSuper(
    @Param('blockId') blockId: number,
    @Body() updateDto: BlockUpdateDto,
  ): Promise<HttpResponseFilter<BlockModel>> {
    return HttpResponseFilter.response<BlockModel>(
      await this.blockProvider.update(blockId, updateDto, null),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Post('/copy/:companyId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async copyToCompany(
    @Body('blocks') blocks: number[],
    @Param('companyId') companyId: number,
  ): Promise<HttpResponseFilter<BlockModel[] | void>> {
    return HttpResponseFilter.response<BlockModel[] | void>(
      await this.blockProvider.copyToCompany(blocks, companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(AdminGuard)
  @Post('stat/:blockId/:week')
  @HttpCode(ResponseStatus.SUCCESS)
  public async saveStat(
    @Param('blockId') blockId: number,
    @Param('week') week: number,
    @Req() req,
  ): Promise<HttpResponseFilter<BlockGroupStatOutputDto[]>> {
    return HttpResponseFilter.response<BlockGroupStatOutputDto[]>(
      await this.blockProvider.saveStat(blockId, week, req.user.companyId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Post('/super/stat/:blockId/:week')
  @HttpCode(ResponseStatus.SUCCESS)
  public async superSaveStat(
    @Param('blockId') blockId: number,
    @Param('week') week: number,
  ): Promise<HttpResponseFilter<BlockGroupStatOutputDto[]>> {
    return HttpResponseFilter.response<BlockGroupStatOutputDto[]>(
      await this.blockProvider.saveStat(blockId, week),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(AdminGuard)
  @Post('/stat/:blockId/:week/:groupId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async saveStatByGroup(
    @Param('blockId') blockId: number,
    @Param('week') week: number,
    @Param('groupId') groupId: number,
    @Req() req,
  ): Promise<HttpResponseFilter<BlockGroupStatOutputDto[]>> {
    return HttpResponseFilter.response<BlockGroupStatOutputDto[]>(
      await this.blockProvider.saveStat(
        blockId,
        week,
        req.user.companyId,
        groupId,
      ),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Post('/super/stat/:blockId/:week/:groupId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async superSaveStatByGroup(
    @Param('blockId') blockId: number,
    @Param('week') week: number,
    @Param('groupId') groupId: number,
  ): Promise<HttpResponseFilter<BlockGroupStatOutputDto[]>> {
    return HttpResponseFilter.response<BlockGroupStatOutputDto[]>(
      await this.blockProvider.saveStat(blockId, week, null, groupId),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(AdminGuard)
  @Post('/stat/:blockId/:week/:groupId/special')
  @HttpCode(ResponseStatus.SUCCESS)
  public async saveStatSpecialIds(
    @Param('blockId') blockId: number,
    @Param('week') week: number,
    @Param('groupId') groupId: number,
    @Body('resultIds') resultIds: number[],
    @Req() req,
  ): Promise<HttpResponseFilter<BlockGroupStatOutputDto[]>> {
    return HttpResponseFilter.response<BlockGroupStatOutputDto[]>(
      await this.blockProvider.saveStat(
        blockId,
        week,
        req.user.companyId,
        groupId,
        resultIds,
      ),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(SuperAdminGuard)
  @Post('/super/stat/:blockId/:week/:groupId/special')
  @HttpCode(ResponseStatus.SUCCESS)
  public async superSaveStatSpecialIds(
    @Param('blockId') blockId: number,
    @Param('week') week: number,
    @Param('groupId') groupId: number,
    @Body('resultIds') resultIds: number[],
  ): Promise<HttpResponseFilter<BlockGroupStatOutputDto[]>> {
    return HttpResponseFilter.response<BlockGroupStatOutputDto[]>(
      await this.blockProvider.saveStat(
        blockId,
        week,
        null,
        groupId,
        resultIds,
      ),
      ResponseStatus.SUCCESS,
    );
  }

  @UseGuards(AdminGuard)
  @Get('/:blockId/stat/exists/:week')
  @HttpCode(ResponseStatus.SUCCESS)
  public async checkStatExists(
    @Param('blockId') blockId: number,
    @Param('week') week: number,
  ): Promise<HttpResponseFilter<GroupBlockStatModel[]>> {
    return HttpResponseFilter.response<GroupBlockStatModel[]>(
      await this.blockProvider.checkStatExists(blockId, week),
      ResponseStatus.SUCCESS,
    );
  }
}
