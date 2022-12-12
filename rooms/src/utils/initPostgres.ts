import * as dotenv from "dotenv";
dotenv.config();
import pg from "pg";

if (!process.env.ROOMS_PG_PASSWORD) {
  throw new Error("missing ROOMS_PG_PASSWORD environment variable");
}

export default (host: string) => {
  // Create a new connection pool
  const pool = new pg.Pool({
    user: "postgres",
    password: process.env.ROOMS_PG_PASSWORD,
    host,
    port: 5432,
    max: 5,
  });

  // Asynchronously query the database
  const query = async <T extends pg.QueryResultRow>(queryStr: string, queryValues: unknown[]) => {
    try {
      // Connect to the database
      const client = await pool.connect();

      // Execute the query
      const result = await client.query<T>(queryStr, queryValues);

      // Release the client back to the pool
      client.release();

      // Return the query result
      return result;
    } catch (error) {
      // Handle any errors that occurred
      console.error(error);
      throw error;
    }
  };

  return { query };
};
