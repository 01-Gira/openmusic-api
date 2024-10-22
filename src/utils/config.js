const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  postgres: {
    pgUser : process.env.PGUSER,
    pgHost : process.env.PGHOST,
    pgPassword : process.env.PGPASSWORD,
    pgDatabase : process.env.PGDATABASE,
    pgPort : process.env.PGPORT
  },
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME,
    region: process.env.AWS_REGION,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
  redis: {
    host: process.env.REDIS_SERVER,
  },
};

module.exports = config;