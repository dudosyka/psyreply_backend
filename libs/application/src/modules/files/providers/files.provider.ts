import { Injectable, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import { BaseProvider } from '../../base/base.provider';
import { FilesModel } from '../models/files.model';

@Injectable()
export class FilesProvider extends BaseProvider<FilesModel> {
  async upload(file: Express.Multer.File): Promise<void> {
    await FilesModel.create({
      path: file.filename,
    });
  }

  async stream(fileId: number): Promise<StreamableFile> {
    const fileModel = await FilesModel.findOne({
      where: {
        id: fileId,
      },
    });

    console.log(process.cwd());

    const file = createReadStream(
      join(process.cwd(), 'upload', fileModel.path),
    );
    return new StreamableFile(file);
  }
}
