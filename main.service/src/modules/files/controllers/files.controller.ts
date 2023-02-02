import {
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post, StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ResponseFilter, ResponseStatus } from "../../../filters/response.filter";
import { FilesProvider } from "../providers/files.provider";
import { AdminGuard } from "../../../guards/admin.guard";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";

@Controller('files')
export class FilesController {

  constructor(
    @Inject(FilesProvider) private filesProvider: FilesProvider
  ) {
  }

  @Post("/import")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(ResponseStatus.SUCCESS)
  public async upload(
    @UploadedFile('file') file: Express.Multer.File
  ): Promise<ResponseFilter<void>> {
    return ResponseFilter.response<void>(await this.filesProvider.upload(file), ResponseStatus.SUCCESS);
  }

  @Get("/stream/:fileId")
  @HttpCode(ResponseStatus.SUCCESS)
  public async stream(
    @Param("fileId") fileId: number
  ): Promise<StreamableFile> {
    return await this.filesProvider.stream(fileId);
  }
}