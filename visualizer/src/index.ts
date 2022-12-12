import { EventKeys, RoomExpired, RoomVisualized, PollOptions } from "./types/events.js";
import initExpress from "./utils/initExpress.js";
import initEventBus from "./utils/initRabbit.js";
import initMongo from "./utils/initMongo.js";

// Event Types that email service is interested in
type Event = RoomVisualized | RoomExpired;

type Room = {
  id: string;
  user_id: string;
  title: string;
  about: string;
  room_type: "message" | "poll";
  duration: number;
  create_date: string;
  expire_date: string;
};

type Message = { votes: number; id: string; room_id: string; content: string };

type Poll = { room_id: string; poll_options: PollOptions[] };

type MessageRoom = Room & { messages: Message[] };

type PollRoom = Room & { polls: Poll[] };

type RoomData = MessageRoom | PollRoom;

const queue = "visualizer";
const subscriptions: EventKeys[] = ["RoomVisualized", "RoomExpired"];

// Initialize outside communications
const { eventBusChannel, confirmChannel } = await initEventBus(queue, subscriptions);
const { mongoCollection } = await initMongo();

const app = initExpress(4013);

const getRoomData = async (room_id: string) => {
  try {
    const response = await fetch(`http://query:4011/query/${room_id}`);
    return await response.json();
  } catch (e) {
    console.log(e);
    return null;
  }
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
        const resData: RoomData = await getRoomData(id);
        console.log("RESDATA", resData);

        if (!resData.id) {
          console.log("Room Data Invalid");
          return;
        }

        // Generate Image for RoomData
        const response = await fetch("http://visual-generator:4010/visual", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: id, roomData: resData }),
        });

        // Get Image URL
        const { imageUrl } = await response.json();

        // Update DB
        await mongoCollection.updateOne(
          { email: "gsdfg@gmail.com" },
          {
            $push: {
              visualizations: { imageUrl: "url", room_id: "id" },
            },
          },
          { upsert: true }
        );

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
