import initRabbit from "./utils/initRabbit.js";
import initMongo from "./utils/initMongo.js";
import initExpress from "./utils/initExpress.js";
import { auth } from "./utils/initExpress.js";

import type { MessageModerated, MessageVoted, PollVoted, RoomCreated, RoomExpired, PollCreated, RoomVisualized, MessageCreated } from "./types/events.js";
import { ObjectId } from "mongodb";

const { eventBusChannel } = await initRabbit("query", [
  "RoomCreated",
  "RoomExpired",
  "RoomVisualized",
  "MessageVoted",
  "MessageModerated",
  "PollVoted",
  "PollCreated",
  "MessageCreated",
]);

const { mongoCollection } = await initMongo();

const app = initExpress(4011);

type Event = RoomCreated | PollCreated | PollVoted | MessageVoted | MessageModerated | RoomVisualized | RoomExpired | MessageCreated;

// Listen for incoming messages
eventBusChannel?.consume("query", (message) => {
  if (message !== null) {
    const { key, data }: Event = JSON.parse(message.content.toString());

    console.log(`Received event of type ${key}`);

    switch (key) {
      default:
      case "RoomCreated": {
        break;
      }
      case "RoomExpired": {
        break;
      }
      case "RoomVisualized": {
        break;
      }
      case "MessageVoted": {
        break;
      }
      case "MessageModerated": {
        break;
      }
      case "PollVoted": {
        break;
      }
      case "PollCreated": {
        break;
      }
      case "MessageCreated": {
        break;
      }
    }

    eventBusChannel.ack(message);
  }
});

const fetchData = async () => {
  const findResult = (await mongoCollection.find().toArray()) as any[];

  return findResult[0];
};

app.get("/query", async (req, res) => {
  res.send(await fetchData());
});
