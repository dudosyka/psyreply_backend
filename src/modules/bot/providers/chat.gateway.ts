import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server } from 'socket.io'
import { from, map, Observable } from "rxjs";
import { UseGuards } from "@nestjs/common";
import { WsGuard } from "../../../guards/ws.auth.guard";

@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @UseGuards(WsGuard)
  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
}