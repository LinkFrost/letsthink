import * as dotenv from "dotenv";
dotenv.config();
import pg from "pg";

if (!process.env.USERS_PG_PASSWORD) {
  throw new Error("missing USERS_POSTGRES_PASSWORD environment variable");
}

export default async (host: string) => {
  return {
    pgClient: await new pg.Pool({
      user: "postgres",
      password: process.env.USERS_PG_PASSWORD,
      host: host,
      port: 5432,
    }).connect(),
  };
};
