import dbConf from './db.conf';

export enum ProjectState {
  DEV,
  TEST_PROD,
  PROD,
}

export default {
  isDev: ProjectState.DEV,
  db: {
    ...dbConf,
  },
  port: 3000,
  mainAppPort: 8084
};
