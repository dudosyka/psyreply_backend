import {
  Body,
  Controller,
  ForbiddenException,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { LoggerProvider } from '../providers/logger.provider';
import loggerConf from '../../../confs/logger.conf';
import { ErrorOutputDto } from '../dtos/error.output.dto';

@Controller('logger')
export class LoggerController {
  constructor(@Inject(LoggerProvider) private loggerProvider: LoggerProvider) {}

  @Post()
  async getAll(
    @Body('passphrase') passphrase: string,
  ): Promise<ErrorOutputDto[]> {
    if (passphrase == loggerConf.passphrase)
      return (await this.loggerProvider.getAll()).map((el) => {
        return {
          id: el.id,
          name: el.name,
          message: el.message,
          stack: JSON.parse(el.stack),
          // image: el.image,
          timestamp: el.createdAt,
        };
      });
    else
      throw new ForbiddenException(
        new Error('Failed passphrase'),
        'Passphrase check failed',
      );
  }

  @Post('sub')
  async addChlenSubscriber(
    @Req() request,
    @Body('email') email: string,
  ): Promise<string> {
    console.log(request.body);
    await this.loggerProvider.addChlenSubscriber(request.body.message.text);
    return 'string';
  }
}
