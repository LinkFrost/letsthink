import initRabbit from "./utils/initRabbit.js";
import initExpress from "./utils/initExpress.js";
import initMongo from "./utils/initMongo.js";
import { WithId, ObjectId } from "mongodb";

import type { MessageModerated, MessageVoted, PollVoted, RoomCreated, RoomExpired, UserCreated, HTTPRequest } from "./types/events.js";

const { mongoCollection } = await initMongo();

// Initializing db
try {
  // create a document to insert
  const findResult = (await mongoCollection.find().toArray()) as SiteHealthData[];

  if (findResult.length < 1) {
    const doc = {
      totalRooms: 0,
      activeRooms: 0,
      expiredRooms: 0,
      pollRooms: 0,
      messageRooms: 0,
      totalVotes: 0,
      totalMessages: 0,
      totalUsers: 0,
      totalRequests: 0,
      errors: 0,
    };

    await mongoCollection.insertOne(doc);
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

const app = initExpress(4009);

interface SiteHealthData extends WithId<Document> {
  _id: ObjectId;
  totalRooms: number;
  activeRooms: number;
  expiredRooms: number;
  pollRooms: number;
  messageRooms: number;
  totalVotes: number;
  totalMessages: number;
  totalUsers: number;
  totalRequests: number;
  errors: number;
}

type Event = RoomCreated | RoomExpired | MessageModerated | UserCreated | PollVoted | MessageVoted | HTTPRequest;

// Listen for incoming messages
eventBusChannel.consume("site-health", async (message) => {
  if (message !== null) {
    const { key, data }: Event = JSON.parse(message.content.toString());
    const siteHealthData: SiteHealthData = await fetchSiteHealthData();

    switch (key) {
      case "RoomExpired": {
        const updateDoc = {
          $set: {
            expiredRooms: siteHealthData.expiredRooms + 1,
          },
        };

        const result = await mongoCollection.updateOne({}, updateDoc);
        break;
      }
      case "RoomCreated": {
        if (data.room_type === "message") {
          const updateDoc = {
            $set: {
              totalRooms: siteHealthData.totalRooms + 1,
              activeRooms: siteHealthData.activeRooms + 1,
              messageRooms: siteHealthData.messageRooms + 1,
            },
          };
          const result = await mongoCollection.updateOne({}, updateDoc);
        } else {
          const updateDoc = {
            $set: {
              totalRooms: siteHealthData.totalRooms + 1,
              activeRooms: siteHealthData.activeRooms + 1,
              pollRooms: siteHealthData.pollRooms + 1,
            },
          };
          const result = await mongoCollection.updateOne({}, updateDoc);
        }
        break;
      }
      case "MessageModerated": {
        if (data.moderated === "accepted") {
          const updateDoc = {
            $set: {
              totalMessages: siteHealthData.totalMessages + 1,
            },
          };

          const result = await mongoCollection.updateOne({}, updateDoc);
        }
        break;
      }
      case "UserCreated": {
        const updateDoc = {
          $set: {
            totalUsers: siteHealthData.totalUsers + 1,
          },
        };

        const result = await mongoCollection.updateOne({}, updateDoc);
        break;
      }
      case "PollVoted": {
        const updateDoc = {
          $set: {
            totalVotes: siteHealthData.totalVotes + 1,
          },
        };

        const result = await mongoCollection.updateOne({}, updateDoc);
        break;
      }
      case "MessageVoted": {
        const updateDoc = {
          $set: {
            totalVotes: siteHealthData.totalVotes + 1,
          },
        };

        const result = await mongoCollection.updateOne({}, updateDoc);
        break;
      }
      case "HTTPRequest": {
        let change = 0;

        if (data.status >= 500) {
          change = 1;
        }

        const updateDoc = {
          $set: {
            totalRequests: siteHealthData.totalRequests + 1,
            errors: siteHealthData.errors + change,
          },
        };

        const result = await mongoCollection.updateOne({}, updateDoc);
        break;
      }
    }

    // Acknowledge the message to the queue
    eventBusChannel.ack(message);
  }
});

const fetchSiteHealthData = async () => {
  const findResult = (await mongoCollection.find().toArray()) as SiteHealthData[];

  return findResult[0];
};

app.get("/site-health", async (req, res) => {
  const siteHealthData: SiteHealthData = await fetchSiteHealthData();
  res.send({
    totalRooms: siteHealthData.totalRooms,
    activeRooms: siteHealthData.activeRooms,
    expiredRooms: siteHealthData.expiredRooms,
    pollRooms: siteHealthData.pollRooms,
    messageRooms: siteHealthData.messageRooms,
    totalVotes: siteHealthData.totalVotes,
    totalMessages: siteHealthData.totalMessages,
    totalUsers: siteHealthData.totalUsers,
    totalRequests: siteHealthData.totalRequests,
    errors: siteHealthData.errors,
  });
});
