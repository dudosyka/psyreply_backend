import * as dbConf from "./db.conf";
import * as mailerConf from "./mailer.conf";

export enum ProjectState {
  DEV, TEST_PROD, PROD,
}

export default {
  isDev: ProjectState.DEV,
  jwtConstants: {
    secret: "SECRET_KEY"
  },
  db: {
    ...dbConf
  },
  mailer: {
    ...mailerConf
  },
  emailCode: {
    max: 999999,
    min: 111111
  },
  devPort: 8080,
  prodPort: 8082
};
