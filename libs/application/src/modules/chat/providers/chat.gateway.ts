import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  forwardRef,
  Inject,
  Injectable,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WsGuard } from '../../../guards/ws.auth.guard';
import { ChatProvider } from './chat.provider';
import { BotProvider } from '../../bot/providers/bot.provider';
import { WsResponseFilter } from '@app/application/filters/ws-response.filter';
import { ResponseStatus } from '@app/application/filters/http-response.filter';
import { ClientNewMessageDto } from '@app/application/modules/chat/dto/client-new-message.dto';
import { WsExceptionFilter } from '@app/application/filters/ws-exception.filter';
import { MessageOutputDto } from '@app/application/modules/chat/dto/message-output.dto';
import { MessageClientOutputDto } from '@app/application/modules/chat/dto/message-client-output.dto';

@Injectable()
@UseFilters(WsExceptionFilter)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(
    @Inject(ChatProvider) private chatProvider: ChatProvider,
    @Inject(forwardRef(() => BotProvider))
    private botProvider: BotProvider,
  ) {}

  @WebSocketServer()
  server: Server;

  @UseGuards(WsGuard)
  @SubscribeMessage('subscribe_chat')
  subscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody('chatId') chatId: string,
  ): string {
    this.chatProvider.joinRoom(client, chatId);
    return WsResponseFilter.response<string>('', ResponseStatus.SUCCESS);
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('sendMessage')
  @UsePipes(ValidationPipe)
  async newMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() newMessageDto: ClientNewMessageDto,
  ) {
    const data = await this.botProvider.newMessageInside(newMessageDto);
    return WsResponseFilter.responseObject<MessageClientOutputDto>(
      {
        id: data.messageModel.id,
        chat_id: data.chatMessageModel.chat_id,
        direction: data.chatMessageModel.direction,
        type_id: data.messageModel.type_id,
        content: data.messageModel.content,
        createdAt: data.messageModel.createdAt,
        updatedAt: data.messageModel.updatedAt,
      },
      ResponseStatus.CREATED,
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<string> {
    return WsResponseFilter.response<number>(data, ResponseStatus.SUCCESS);
  }

  sendTo(room: string, data: MessageOutputDto) {
    this.server.to(room).emit(
      'newMessage',
      WsResponseFilter.responseObject<MessageClientOutputDto>(
        {
          id: data.messageModel.id,
          chat_id: data.chatMessageModel.chat_id,
          direction: data.chatMessageModel.direction,
          type_id: data.messageModel.type_id,
          content: data.messageModel.content,
          createdAt: data.messageModel.createdAt,
          updatedAt: data.messageModel.updatedAt,
        },
        ResponseStatus.SUCCESS,
      ),
    );
  }
}
