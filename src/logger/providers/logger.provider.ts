import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { LoggerModel } from "../models/logger.model";
import { ErrorCreateDto } from "../dtos/error.create.dto";

@Injectable()
export class LoggerProvider {
  constructor(
    @InjectModel(LoggerModel) private loggerModel: LoggerModel
  ) {
  }

  log(error: ErrorCreateDto): void {
    LoggerModel.create(error);
  }

  getAll(): Promise<LoggerModel[]> {
    return LoggerModel.findAll();
  }
}
