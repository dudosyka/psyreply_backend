import { ChatMessageModel } from '@app/application/modules/bot/models/chat-message.model';
import { MessageModel } from '@app/application/modules/bot/models/message.model';

export type MessageOutputDto = {
  chatMessageModel: ChatMessageModel;
  messageModel: MessageModel;
};
