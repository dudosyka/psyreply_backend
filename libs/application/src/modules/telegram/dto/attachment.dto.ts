export enum AttachmentType {
  FILE,
  LINK,
  TEST,
}
export class AttachmentDto {
  id?: string;
  type: AttachmentType;
  link: string;
}
