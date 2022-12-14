import { EventKeys, RoomExpired, RoomVisualized, PollOptions } from "./types/events.js";
import initExpress from "./utils/initExpress.js";
import initEventBus from "./utils/initRabbit.js";
import initMongo from "./utils/initMongo.js";
import { WithId, ObjectId } from "mongodb";

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

interface UserData extends WithId<Document> {
  __id: ObjectId;
  id: string;
  email: string;
  username: string;
}

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
    const response = await fetch(`http://query:4011/query/rooms/${room_id}`);

    if (!response.ok) {
      console.log("Room Data Invalid");
      return null;
    }

    return await response.json();
  } catch (e) {
    console.log(e);
    return null;
  }
};

const getUserData = async (user_id: string) => {
  try {
    const response = await fetch(`http://query:4011/query/users/${user_id}`);

    if (!response.ok) {
      console.log("User Data Invalid");
      return null;
    }

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

        if (!resData?.id) {
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

        if (!response.ok) {
          console.log("PYTHON SERVER BROKEN");
          return;
        }

        // Get Image URL
        const { imageUrl } = await response.json();

        // Get User Data by Id
        const userData: UserData = await getUserData(resData.user_id);

        // Update DB
        await mongoCollection.updateOne(
          { email: userData.email },
          {
            $push: {
              visualizations: { imageUrl: imageUrl, room_id: id },
            },
          },
          { upsert: true }
        );

        // Publish Visualization
        const event: RoomVisualized = {
          key: "RoomVisualized",
          data: { id: id, room_id: id, title: resData.title, user_email: userData.email, username: userData.id, imageUrl: imageUrl },
        };
        eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

        break;
      default:
    }
  } catch (err) {
    console.log("CRASHED ON NACK");
    eventBusChannel.nack(message);
  }

  eventBusChannel.ack(message);
});

app.get("/visualizer", async (req, res) => {
  res.send("Viz Service Running");
});
