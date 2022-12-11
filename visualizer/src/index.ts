import { EventKeys, RoomExpired, RoomVisualized } from "./types/events.js";
import initExpress from "./utils/initExpress.js";
import initEventBus from "./utils/initRabbit.js";
import initMongo from "./utils/initMongo.js";

// Event Types that email service is interested in
type Event = RoomVisualized | RoomExpired;

const queue = "visualizer";
const subscriptions: EventKeys[] = ["RoomVisualized", "RoomExpired"];

// Initialize outside communications
const { eventBusChannel, confirmChannel } = await initEventBus(queue, subscriptions);
const { mongoCollection } = await initMongo();

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

// Handle Event Bus Subscriptions
eventBusChannel.consume(queue, async (message) => {
  if (!message) return;

  const { key, data }: Event = JSON.parse(message.content.toString());

  console.log(`Received event of type ${key}`);

  try {
    switch (key) {
      case "RoomVisualized":
        break;
      case "RoomExpired":
        break;
      default:
    }
  } catch (err) {
    eventBusChannel.nack(message);
  }

  eventBusChannel.ack(message);
});

app.get("/visualizer", async (req, res) => {
  res.send("test");
});
