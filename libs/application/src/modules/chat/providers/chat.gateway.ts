import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject, Injectable, UseGuards } from '@nestjs/common';
import { WsGuard } from '../../../guards/ws.auth.guard';
import { ChatProvider } from './chat.provider';
import { BotProvider } from '../../bot/providers/bot.provider';

@Injectable()
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
    return 'registered successfully';
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('sendMessage')
  async newMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody('msg') msg: string,
    @MessageBody('chatId') chatId: number,
    @MessageBody('botUserId') botUserId: number,
  ) {
    let msgDto;
    try {
      msgDto = JSON.parse(msg);
    } catch (e) {
      return JSON.stringify({ status: 'failed', body: 'invalid msg' });
    }
    return JSON.stringify({
      status: 'success',
      body: await this.botProvider.emitNewMessage(
        chatId,
        msgDto,
        botUserId,
        client.user.sub,
      ),
    });
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
}
