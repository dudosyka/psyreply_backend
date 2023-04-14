import { Injectable, StreamableFile } from '@nestjs/common';
import * as fs from 'fs';
import { createReadStream, ReadStream } from 'fs';
import { join } from 'path';
import { BaseProvider } from '../../base/base.provider';
import { FilesModel } from '../models/files.model';
import * as http from 'http';

@Injectable()
export class FilesProvider extends BaseProvider<FilesModel> {
  async upload(file: Express.Multer.File): Promise<FilesModel> {
    return await FilesModel.create({
      path: file.filename,
    });
  }

  async getFile(
    fileId: number,
  ): Promise<{ stream: ReadStream; name: string } | null> {
    const fileModel = await FilesModel.findOne({
      where: {
        id: fileId,
      },
    });

    if (fileModel == null) {
      return null;
    }

    return {
      stream: createReadStream(join(process.cwd(), 'upload', fileModel.path)),
      name: fileModel.path,
    };
  }

  async stream(fileId: number): Promise<StreamableFile> {
    return new StreamableFile((await this.getFile(fileId)).stream);
  }

  async uploadByLink(link: string): Promise<FilesModel> {
    return new Promise((resolve) =>
      http.get(link, (res) => {
        const fileName = `${Date.now()}${
          link.split('/')[link.split('/').length - 1]
        }`;
        const path = join(process.cwd(), 'upload', fileName);

        const stream = fs.createWriteStream(path);

        res.pipe(stream);

        stream.on('finish', async () => {
          stream.close();
          resolve(
            await FilesModel.create({
              path: fileName,
            }),
          );
        });
      }),
    );
  }

  async moveToFiles(link): Promise<FilesModel> {
    return new Promise(async (resolve) => {
      const fileName = `${Date.now()}${
        link.split('/')[link.split('/').length - 1]
      }`;
      const path = join(process.cwd(), 'upload', fileName);
      fs.copyFile(link, path, (res) => {
        console.log(res);
      });
      resolve(
        await FilesModel.create({
          path: fileName,
        }),
      );
    });
  }
}
