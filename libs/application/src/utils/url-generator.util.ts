import mainConf, { ProjectState } from '@app/application/config/main.conf';

export class UrlGeneratorUtil {
  public static generateClientEndpoint() {
    let clientUrl = 'http://localhost:8080/';
    if (mainConf().isDev == ProjectState.TEST_PROD) {
      clientUrl = 'https://client.beta.psyreply.com/';
    } else if (mainConf().isDev == ProjectState.PROD) {
      clientUrl = 'https://client.psyreply.com/';
    } else if (mainConf().isDev == ProjectState.SECOND_PROD) {
      clientUrl = 'https://client.second.psyreply.com/';
    }

    return clientUrl;
  }
}
