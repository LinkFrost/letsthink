import pg from "pg";

if (!process.env.POSTGRES_PASSWORD) {
  throw new Error("missing POSTGRES_PASSWORD environment variable");
}

export default async (host: string) =>
  await new pg.Pool({
    user: "postgres",
    password: process.env.POSTGRES_PASSWORD,
    host,
    port: 5432,
  }).connect();
