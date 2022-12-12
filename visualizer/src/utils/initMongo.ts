import * as dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";

const MONGO_USER = process.env.SH_MONGO_USER;
const MONGO_PASSWORD = process.env.SH_MONGO_PASSWORD;
const MONGO_URI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@letsthink-visualizer-db/?authMechanism=DEFAULT`;

if (!MONGO_USER || !MONGO_PASSWORD) {
  throw new Error("Missing one or more SH_MONGO environment variables");
}

export default async function () {
  const client = new MongoClient(MONGO_URI);
  const database = client.db("visualizer");
  const mongoCollection = database.collection("visualizer");

  return { mongoCollection };
}
