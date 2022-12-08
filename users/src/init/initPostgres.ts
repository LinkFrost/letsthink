import * as dotenv from "dotenv";
dotenv.config();
import pg from "pg";

if (!process.env.POSTGRES_PASSWORD) {
  throw new Error("missing POSTGRES_PASSWORD environment variable");
}

export default async (host: string) => {
  return {
    postgres: await new pg.Pool({
      user: "postgres",
      password: process.env.POSTGRES_PASSWORD,
      host: host,
      port: 5432,
    }).connect(),
  };
};