import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { MulterConfigModule } from "../../confs/multer-config.module";
import { FilesController } from "./controllers/files.controller";
import { FilesProvider } from "./providers/files.provider";
import { SequelizeModule } from "@nestjs/sequelize";
import { FilesModel } from "./models/files.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      FilesModel
    ]),
    MulterModule.registerAsync({
      useClass: MulterConfigModule
    }),
  ],
  controllers: [FilesController],
  providers: [FilesProvider]
})
export class FilesModule {}