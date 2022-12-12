import * as dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";

const MONGO_USER = process.env.MODERATOR_MONGO_USER;
const MONGO_PASSWORD = process.env.MODERATOR_MONGO_PASSWORD;
const MONGO_URI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@letsthink-moderator-db/?authMechanism=DEFAULT`;
console.log(MONGO_URI);

export default async function (db: string, collections: string[]) {
  const client = new MongoClient(MONGO_URI);
  const database = client.db(db);

  return collections.map((c) => database.collection(c));
}
