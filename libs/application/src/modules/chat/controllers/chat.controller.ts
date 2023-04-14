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
import { UserNoteModel } from '@app/application/modules/bot/models/user-note.model';
import { UserNoteCreateDto } from '@app/application/modules/chat/dto/user-note-create.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ChatController {
  constructor(@Inject(ChatProvider) private chatProvider: ChatProvider) {}

  @Get(':botUserId/info')
  @HttpCode(ResponseStatus.SUCCESS)
  public async getBotUserInfo(
    @Param('botUserId') botUserId: number,
  ): Promise<HttpResponseFilter<ChatUserInfoOutputDto>> {
    return HttpResponseFilter.response<ChatUserInfoOutputDto>(
      await this.chatProvider.getChatInfo(botUserId),
      ResponseStatus.SUCCESS,
    );
  }

  @Post(':botUserId/note')
  @HttpCode(ResponseStatus.CREATED)
  public async createNote(
    @Param('botUserId') botUserId: number,
    @Body() createDto: UserNoteCreateDto,
  ): Promise<HttpResponseFilter<UserNoteModel>> {
    return HttpResponseFilter.response<UserNoteModel>(
      await this.chatProvider.createNote(botUserId, createDto),
      ResponseStatus.CREATED,
    );
  }

  @Delete(':botUserId/note/:noteId')
  @HttpCode(ResponseStatus.NO_CONTENT)
  public async removeNot(
    @Param('botUserId') botUserId: number,
    @Param('noteId') noteId: number,
  ) {
    await this.chatProvider.removeNote(botUserId, noteId);
  }
}
