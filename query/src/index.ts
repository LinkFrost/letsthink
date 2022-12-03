import amqplib from "amqplib";
import express from "express";
import initRabbit from "./initRabbit.js";
import pg from "pg";
import cors from "cors";
import type { MessageModerated, MessageVoted, PollVoted, RoomCreated, RoomExpired, PollCreated, RoomVisualized, MessageCreated } from "./events.js";

const { eventBusChannel, confirmChannel } = await initRabbit("query", [
  "RoomCreated",
  "RoomExpired",
  "RoomVisualized",
  "MessageVoted",
  "MessageModerated",
  "PollVoted",
  "PollCreated",
  "MessageCreated",
]);

const pgClient = new pg.Pool({
  user: "postgres",
  password: "postgres",
  host: "query-db",
  port: 5432,
});

await pgClient.connect();

const app = express();
app.use(express.json());
app.use(cors());

type Event = RoomCreated | PollCreated | PollVoted | MessageVoted | MessageModerated | RoomVisualized | RoomExpired | MessageCreated;

// Listen for incoming messages
eventBusChannel?.consume("query", (message: amqplib.ConsumeMessage | null) => {
  if (message !== null) {
    const { key, data }: Event = JSON.parse(message.content.toString());

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

app.listen(4011, () => {
  console.log("query service listening on port 4011");
});
