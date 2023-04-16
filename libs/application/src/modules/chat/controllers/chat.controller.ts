import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/application/guards/jwt-auth.guard';
import { AdminGuard } from '@app/application/guards/admin.guard';
import {
  HttpResponseFilter,
  ResponseStatus,
} from '@app/application/filters/http-response.filter';
import { ChatUserInfoOutputDto } from '@app/application/modules/chat/dto/chat-user-info-output.dto';
import { ChatProvider } from '@app/application/modules/chat/providers/chat.provider';
import { ChatNoteModel } from '@app/application/modules/bot/models/chat-note.model';
import { UserNoteCreateDto } from '@app/application/modules/chat/dto/user-note-create.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ChatController {
  constructor(@Inject(ChatProvider) private chatProvider: ChatProvider) {}

  @Get(':chatId')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getChatInfo(
    @Param('chatId') chatId: number,
  ): Promise<HttpResponseFilter<ChatUserInfoOutputDto>> {
    return HttpResponseFilter.response<ChatUserInfoOutputDto>(
      await this.chatProvider.getChatInfo(chatId),
      ResponseStatus.SUCCESS,
    );
  }

  @Post(':chatId/note')
  @HttpCode(ResponseStatus.CREATED)
  public async createNote(
    @Param('chatId') chatId: number,
    @Body() createDto: UserNoteCreateDto,
  ): Promise<HttpResponseFilter<ChatNoteModel>> {
    return HttpResponseFilter.response<ChatNoteModel>(
      await this.chatProvider.createNote(chatId, createDto),
      ResponseStatus.CREATED,
    );
  }

  @Delete(':chatId/note/:noteId')
  @HttpCode(ResponseStatus.NO_CONTENT)
  public async removeNot(
    @Param('botUserId') chatId: number,
    @Param('noteId') noteId: number,
  ) {
    await this.chatProvider.removeNote(chatId, noteId);
  }
}
