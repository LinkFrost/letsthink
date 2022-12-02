import amqplib from "amqplib";
import express from "express";
import pg from "pg";
import { RoomData, Event } from "./types";
import { createClient } from "redis";

// Connect to service specific database
const pgClient = new pg.Pool({
  user: "postgres",
  password: "postgres",
  host: "messages-db",
  port: 5432,
});

await pgClient.connect();

// Connect to rabbitmq, create a channel
const eventBusConnection: amqplib.Connection = await amqplib.connect("amqp://event-bus:5672");
const eventBusChannel: amqplib.Channel = await eventBusConnection.createChannel();

const queue: string = "messages";
const exchange: string = "event-bus";

// Create exchange
eventBusChannel.assertExchange(exchange, "direct", {
  durable: false,
});

// Create queue for service
eventBusChannel.assertQueue(queue);

const eventKeys: string[] = ["room-events", "vote-events", "moderator-events", "expiration-events"];

// Subscribe to each event key
eventKeys.forEach((key: string) => {
  eventBusChannel.bindQueue(queue, exchange, key);
});

// Listen for incoming messages
eventBusChannel?.consume(queue, async (message: amqplib.ConsumeMessage | null) => {
  if (message !== null) {
    const { type, data }: Event = JSON.parse(message.content.toString());

    console.log(`Received event of type ${type}`);

    switch (type) {
      case "RoomCreated": {
        const { userId, title, about, duration, roomType, expired } = data;
        if (roomType === "messages") {
          const query = "INSERT INTO rooms(userId, title, about, duration, roomType, expired) VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
          const queryValues = [userId, title, about, duration, roomType, expired];

          try {
            pgClient.query(query, queryValues).then((res) => {
              console.log(res.rows[0]);
            });
          } catch (err) {
            console.log(err);
          }
        }
      }
    }

    eventBusChannel.ack(message);
  }
});

const app = express();
app.use(express.json());

app.post("/messages", async (req, res) => {
  try {
    const { roomId, content } = req.body;

    // Check if given roomId matches a valid room and if that room is expired
    const roomQueryResults = await pgClient.query("SELECT * FROM rooms WHERE id=$1", [roomId]).then((res) => res.rows);

    if (roomQueryResults.length !== 1) {
      return res.status(400).send({ error: `Room with id ${roomId} does not exist!` });
    }

    const roomData: RoomData = roomQueryResults[0];

    if (roomData.expired) {
      return res.status(400).send({ error: `Room with id ${roomId} is expired!` });
    }

    const queryText = "INSERT INTO messages(roomId, content) VALUES($1, $2) RETURNING *";
    const queryValues = [roomId, content];

    // Create message in database and send it through the event bus
    pgClient.query(queryText, queryValues);

    const event: Buffer = Buffer.from(JSON.stringify({ type: "MessageCreated", data: req.body }));
    eventBusChannel?.publish("event-bus", "message-events", event);

    res.send(`Sent event of type MessageCreated`);
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

app.listen(4002, () => {
  console.log("Listening on port 4002");
});
