export enum MessageType {
  TEXT, PHOTO, VIDEO, DOCUMENT
}

export type ContentDto = {
  attachments: string[],
  text: string
}