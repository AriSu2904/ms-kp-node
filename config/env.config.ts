export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  service: {
    candidate: {
      baseUrl: process.env.MS_CANDIDATES_BASE_URL || 'http://localhost:3000',
      xIdToken: process.env.X_ID_TOKEN || 'DEFAULT',
    },
    admin: {
      baseUrl: process.env.MS_ADMIN_BASE_URL || 'http://localhost:3001',
    },
    machineLearning: {
      baseUrl:
        process.env.MS_MACHINE_LEARNING_BASE_URL || 'http://localhost:3002',
      xIdToken: process.env.MS_MACHINE_LEARNING_X_ID_TOKEN || 'DEFAULT',
    },
  },
});
