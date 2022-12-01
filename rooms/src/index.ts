import amqplib from "amqplib";
import express from "express";
import pg from "pg";

const client = new pg.Client({
  user: "postgres",
  password: "postgres",
  host: "rooms-db",
  port: 5432,
});

client.connect().then(() => {
  client.query("INSERT INTO rooms (username) VALUES ('joe')", (err, res) => {
    console.log(res.rows);
  });
});

// Connect to rabbitmq, create a channel
const eventBusConnection = await amqplib.connect("amqp://event-bus:5672");
const eventBusChannel = await eventBusConnection.createChannel();

const queue: string = "rooms";
const exchange: string = "event-bus";

// Create exchange
eventBusChannel.assertExchange(exchange, "direct", {
  durable: false,
});

// Create queue for service
eventBusChannel.assertQueue(queue);

const eventKeys: string[] = ["expiration-events"];

// Subscribe to each event key
eventKeys.forEach((key: string) => {
  eventBusChannel.bindQueue(queue, exchange, key);
});

type Event = any;

const app = express();
app.use(express.json());

// Listen for incoming messages
eventBusChannel.consume(queue, (message) => {
  if (message !== null) {
    const { type, data }: Event = JSON.parse(message.content.toString());

    switch (type) {
      default:
      // Insert logic for various events here depending on the type and data
      // Case for each event type
    }

    eventBusChannel.ack(message);
  }
});

app.post("/rooms", async (req, res) => {
  try {
    const event: Buffer = Buffer.from(JSON.stringify({ type: "RoomCreated", data: req.body }));
    eventBusChannel?.publish("event-bus", "room-events", event);
    res.send(`Sent event of type RoomCreated`);
  } catch (err) {
    res.send({ error: err });
  }
});

app.listen(4001, () => {
  console.log("Listening on port 4001");
});
