import amqplib from "amqplib";
import initRabbit from "./initRabbit.js";
import express from "express";
import cors from "cors";
import { MongoClient, WithId, ObjectId } from "mongodb";

import type { MessageModerated, MessageVoted, PollVoted, RoomCreated, RoomExpired, UserCreated, HTTPRequest } from "./events.js";

const app = express();
app.use(express.json());
app.use(cors());

const uri = "mongodb://root:rootpassword@letsthink-site-health-db:27017/?authMechanism=DEFAULT";
const client = new MongoClient(uri);
const database = client.db("site-health");
const collection = database.collection("site-health-data");

// Initializing db
try {
  // create a document to insert
  const findResult = (await collection.find().toArray()) as SiteHealthData[];

  let docs: SiteHealthData[] = [];

  await findResult.forEach((doc) => {
    docs.push(doc);
  });

  if (docs.length < 1) {
    const doc = {
      totalRooms: 0,
      activeRooms: 0,
      expiredRooms: 0,
      pollRooms: 0,
      messageRooms: 0,
      totalVotes: 0,
      totalMessages: 0,
      requestRate: 0,
      totalUsers: 0,
      errorRate: 0,
    };

    await collection.insertOne(doc);
  }
} catch (e) {
  console.log(e);
}

const { eventBusChannel, confirmChannel } = await initRabbit("site-health", [
  "RoomCreated",
  "RoomExpired",
  "MessageVoted",
  "MessageModerated",
  "PollVoted",
  "HTTPRequest",
  "UserCreated",
]);

interface SiteHealthData extends WithId<Document> {
  _id: ObjectId;
  totalRooms: number;
  activeRooms: number;
  expiredRooms: number;
  pollRooms: number;
  messageRooms: number;
  totalVotes: number;
  totalMessages: number;
  requestRate: number;
  totalUsers: number;
  errorRate: number;
}

type Event = RoomCreated | RoomExpired | MessageModerated | UserCreated | PollVoted | MessageVoted | HTTPRequest;

// Listen for incoming messages
eventBusChannel.consume("site-health", async (message) => {
  if (message !== null) {
    const { key, data }: Event = JSON.parse(message.content.toString());
    const siteHealthData: SiteHealthData = await fetchSiteHealthData();

    switch (key) {
      case "RoomExpired":
        siteHealthData.expiredRooms += 1;
        updateDatabase(siteHealthData);
        break;
      case "RoomCreated":
        siteHealthData.totalRooms += 1;
        siteHealthData.activeRooms += 1;

        if (data.roomType === "message") {
          siteHealthData.messageRooms += 1;
        } else {
          siteHealthData.pollRooms += 1;
        }
        updateDatabase(siteHealthData);
        break;
      case "MessageModerated": {
        if (data.moderated === "accepted") {
          siteHealthData.totalMessages += 1;
          updateDatabase(siteHealthData);
        }
        break;
      }
      case "UserCreated": {
        siteHealthData.totalUsers += 1;
        updateDatabase(siteHealthData);
        break;
      }
      case "PollVoted": {
        siteHealthData.totalVotes += 1;
        updateDatabase(siteHealthData);
        break;
      }
      case "MessageVoted": {
        siteHealthData.totalVotes += 1;
        updateDatabase(siteHealthData);
        break;
      }
      case "HTTPRequest": {
        const updateDoc = {
          $set: {
            errorRate: siteHealthData.errorRate + 1,
          },
        };

        const result = await collection.updateOne({}, updateDoc);
        break;
      }
    }

    // Acknowledge the message to the queue
    eventBusChannel.ack(message);
  }
});

const fetchSiteHealthData = async () => {
  const findResult = (await collection.find().toArray()) as SiteHealthData[];

  let docs: SiteHealthData[] = [];

  await findResult.forEach((doc) => {
    docs.push(doc);
  });

  return docs[0];
};

app.post("/site-health", async (req, res) => {
  // send event to rabbitMQ
  const event: HTTPRequest = { key: "HTTPRequest", data: { status: 0 } };
  confirmChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));
  await confirmChannel.waitForConfirms();
  res.send(200);
});

const updateDatabase = (siteHealthData: SiteHealthData) => {
  return true;
};

app.listen(4009, () => {
  console.log("site health service listening on port 4009");
});
