import { Document, PhotoSize, TelegrafContext, Video } from "telegraf-ts";

export class MessageMediaService {
  static process(media: PhotoSize | Video | Document, ctx: TelegrafContext): Promise<string[]> {
    return ctx.telegram.getFileLink(media.file_id).then(url => [url])
  }
}