import * as dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";

const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_URI = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@letsthink-email-db/?authMechanism=DEFAULT`;

export default async function () {
  const client = new MongoClient(MONGO_URI);
  const database = client.db("email");
  const mongoCollection = database.collection("sent-emails");

  return { mongoCollection };
}
