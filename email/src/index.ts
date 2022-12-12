import { EventKeys, RoomExpired, RoomVisualized } from "./types/events.js";
import initExpress from "./utils/initExpress.js";
import initEventBus from "./utils/initRabbit.js";
import sendInBlue from "./utils/sendInBlue.js";
import initMongo from "./utils/initMongo.js";

// Event Types that email service is interested in
type Event = RoomVisualized | RoomExpired;

const queue = "email";
const subscriptions: EventKeys[] = ["RoomVisualized", "RoomExpired"];

// Initialize outside communications
const { eventBusChannel, confirmChannel } = await initEventBus(queue, subscriptions);
const { mongoCollection } = await initMongo();
const app = initExpress(4005);
const { sendEmail } = await sendInBlue();

// Handle Event Bus Subscriptions
eventBusChannel.consume(queue, async (message) => {
  if (!message) return;

  const { key, data }: Event = JSON.parse(message.content.toString());

  console.log(`Received event of type ${key}`);

  try {
    switch (key) {
      case "RoomVisualized":
        await sendEmail(data);
        await mongoCollection.updateOne(
          { email: data.user_email },
          {
            $push: {
              visualizations: data.imageUrl,
            },
          },
          { upsert: true }
        );
        break;
      case "RoomExpired":
        console.log("EMAIL: GOT ROOM EXPIRED EVENT");
        break;
      default:
    }
  } catch (err) {
    eventBusChannel.nack(message);
  }

  eventBusChannel.ack(message);
});

// REST Server
app.post("/testSend", (req, res) => {
  const event: RoomVisualized = { key: "RoomVisualized", data: req.body };

  confirmChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

  res.sendStatus(200);
});

app.get("/checkMongo", async (req, res) => {
  const viz = await mongoCollection.find({}).toArray();

  res.send(viz);
});
