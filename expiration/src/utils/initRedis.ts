import * as dotenv from "dotenv";
dotenv.config();
import redis from "redis";

if (!process.env.EXPIRATION_REDIS_PASSWORD) {
  throw new Error("missing EXPIRATION_REDIS_PASSWORD environment variable");
}

export default async () => {
  const options: redis.RedisClientOptions = {
    socket: {
      host: "expiration-db",
      port: 6379,
    },
    username: "default",
    password: process.env.EXPIRATION_REDIS_PASSWORD,
  };

  const redisClient = redis.createClient(options);

  try {
    await redisClient.connect();
  } catch (error) {
    console.log(error);
  }

  return { redisClient };
};
