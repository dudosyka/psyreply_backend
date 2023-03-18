import { Message, User } from 'telegraf-ts';

export class TelegramNewMessageDto {
  botInfo: User;

  message: Message;
}
