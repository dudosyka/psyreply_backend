export class FailedBotLoadingException extends Error {
  constructor(private token: string, private botModelId: number) {
    super();
  }
}
