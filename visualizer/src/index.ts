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

const app = initExpress(4013);

const getRoomData = async (room_id: string) => {
  return {};
};

// Handle Event Bus Subscriptions
eventBusChannel.consume(queue, async (message) => {
  if (!message) return;

  const { key, data }: Event = JSON.parse(message.content.toString());

  console.log(`Received event of type ${key}`);

  try {
    switch (key) {
      case "RoomExpired":
        const { id } = data;

        // Get Room Data by Id
        const resData = await getRoomData(id);

        // Generate Image for RoomData
        const response = await fetch("http://visual-generator:4010/visual", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: id, roomData: [] }),
        });

        // Get Image URL
        const { imageUrl } = await response.json();

        /* Update DB
        await mongoCollection.updateOne(
          { email: data.user_email },
          {
            $push: {
              visualizations: {imageUrl: data.imageUrl, room_id: room_id},
            },
          },
          { upsert: true }
        );
        */

        // Publish Visualization
        const event: RoomVisualized = {
          key: "RoomVisualized",
          data: { id: id, room_id: "string", title: "string", user_email: "string", username: "string", imageUrl: imageUrl },
        };
        eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

        break;
      default:
    }
  } catch (err) {
    eventBusChannel.nack(message);
  }

  eventBusChannel.ack(message);
});

app.get("/visualizer", async (req, res) => {
  const event: RoomExpired = {
    key: "RoomExpired",
    data: { id: "string" },
  };
  eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));
  res.send("test");
});
