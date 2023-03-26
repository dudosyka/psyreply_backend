import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  HttpResponseFilter,
  ResponseStatus,
} from '../../../filters/http-response.filter';
import { FilesProvider } from '../providers/files.provider';
import { AdminGuard } from '../../../guards/admin.guard';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { FilesModel } from '@app/application/modules/files/models/files.model';

@Controller('files')
export class FilesController {
  constructor(@Inject(FilesProvider) private filesProvider: FilesProvider) {}

  @Post('/import')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(ResponseStatus.SUCCESS)
  public async upload(
    @UploadedFile('file') file: Express.Multer.File,
  ): Promise<HttpResponseFilter<FilesModel>> {
    return HttpResponseFilter.response<FilesModel>(
      await this.filesProvider.upload(file),
      ResponseStatus.SUCCESS,
    );
  }

  @Post('/import/link')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(ResponseStatus.SUCCESS)
  public async uploadByLink(
    @Body('file') file: string,
  ): Promise<HttpResponseFilter<void>> {
    return HttpResponseFilter.response<void>(
      await this.filesProvider.uploadByLink(file).then(() => {}),
      ResponseStatus.SUCCESS,
    );
  }

  @Get('/stream/:fileId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async stream(
    @Param('fileId') fileId: number,
  ): Promise<StreamableFile> {
    return await this.filesProvider.stream(fileId);
  }
}
