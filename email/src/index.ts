import * as dotenv from "dotenv";
import { EventKeys, RoomVisualized } from "./util/events.js";
import initExpress from "./init/initExpress.js";
import initEventBus from "./init/initRabbit.js";
import sendInBlue from "./util/sendInBlue.js";

// Event Types that email service is interested in
type Event = RoomVisualized;

const q = "email";
const subscriptions: EventKeys[] = ["RoomVisualized"];

// Initialize outside communications
dotenv.config();
const { eventBusChannel, confirmChannel } = await initEventBus(q, subscriptions);
const { server } = await initExpress();
const { sendEmail } = await sendInBlue();

// Handle Event Bus Subscriptions
eventBusChannel.consume(q, (message) => {
  if (!message) return;

  const { key, data }: Event = JSON.parse(message.content.toString());

  switch (key) {
    case "RoomVisualized":
      sendEmail(data);
      break;
    default:
  }

  eventBusChannel.ack(message);
});

// REST Server
server.post("/testSend", (req, res) => {
  const event: RoomVisualized = { key: "RoomVisualized", data: req.body };
  confirmChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));
  res.send(200);
});

server.listen(4005, () => {
  console.log("Email service listening on port 4005");
});
