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
      default:
        console.log(`Received unexpected envent type: ${key}`);
    }
  } catch (err) {
    eventBusChannel.nack(message);
  }

  eventBusChannel.ack(message);
});
