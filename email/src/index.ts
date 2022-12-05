import { EventKeys, RoomVisualized } from "./util/events.js";
import initExpress from "./init/initExpress.js";
import initEventBus from "./init/initRabbit.js";
import sendInBlue from "./util/sendInBlue.js";
import initMongo from "./init/initMongo.js";
import { z } from "zod";

// Event Types that email service is interested in
type Event = RoomVisualized;

const q = "email";
const subscriptions: EventKeys[] = ["RoomVisualized"];

// Initialize outside communications
const { mongoCollection } = await initMongo();
const { eventBusChannel, confirmChannel } = await initEventBus(q, subscriptions);
const { server } = await initExpress();
const { sendEmail } = await sendInBlue();

// Handle Event Bus Subscriptions
eventBusChannel.consume(q, async (message) => {
  if (!message) return;

  const { key, data }: Event = JSON.parse(message.content.toString());

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
    default:
  }

  eventBusChannel.ack(message);
});

// REST Server
server.post("/testSend", (req, res) => {
  const event: RoomVisualized = { key: "RoomVisualized", data: req.body };

  confirmChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

  res.sendStatus(200);
});

server.get("/checkMongo", async (req, res) => {
  const viz = await mongoCollection.find({}).toArray();

  res.send(viz);
});

server.listen(4005, () => {
  console.log("Email service listening on port 4005");
});
