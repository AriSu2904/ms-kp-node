import * as process from 'node:process';

export default () => ({
  service: {
    candidateService:
      process.env.MS_CANDIDATES_BASE_URL || 'http://localhost:3000',
    xIdToken: process.env.X_ID_TOKEN || 'DEFAULT',
  },
});
