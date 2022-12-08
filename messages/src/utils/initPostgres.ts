import * as dotenv from "dotenv";
dotenv.config();
import pg from "pg";

if (!process.env.MESSAGES_PG_PASSWORD) {
  throw new Error("missing MESSAGES_PG_PASSWORD environment variable");
}

export default async (host: string) =>
  await new pg.Pool({
    user: "postgres",
    password: process.env.MESSAGES_PG_PASSWORD,
    host,
    port: 5432,
  }).connect();
