import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
dotenv.config();
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});


export const vitalsQueue = new Queue("vitalsQueue", {
  connection,
});