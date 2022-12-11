import initRabbit from "./utils/initRabbit.js";
import initMongo from "./utils/initMongo.js";
import initExpress from "./utils/initExpress.js";
import { auth } from "./utils/initExpress.js";

import type { RoomCreated, RoomExpired, RoomVisualized } from "./types/events.js";

const { eventBusChannel } = await initRabbit("query", ["RoomCreated", "RoomExpired", "RoomVisualized"]);

const { mongoCollection } = await initMongo();
console.log("MONGO INITED");

// Initializing db
try {
  // create a document to insert
  const findResult = (await mongoCollection.find().toArray()) as any[];

  if (findResult.length < 1) {
    const doc = {};

    await mongoCollection.insertOne(doc);
  }
} catch (e) {
  console.log(e);
}

const app = initExpress(4013);

type Event = RoomCreated | RoomVisualized | RoomExpired;

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
    }

    eventBusChannel.ack(message);
  }
});

const fetchData = async () => {
  const findResult = (await mongoCollection.find().toArray()) as any[];

  return findResult[0];
};

app.get("/visualizer", async (req, res) => {
  res.send(await fetchData());
});
