import amqplib from "amqplib";
import express from "express";
import pg from "pg";

const client = new pg.Client({
  user: "postgres",
  password: "postgres",
  host: "messages-db",
  port: 5432,
});

await client.connect();

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

interface RoomCreatedEvent {
  type: "RoomCreated";
  data: {
    userId: string;
    title: string;
    about: string;
    duration: number;
    roomType: string;
    expired: boolean;
  };
}

interface RoomData {
  id: string;
  userId: string;
  title: string;
  about: string;
  createdate: string;
  duration: number;
  roomType: string;
  expired: boolean;
}

type Event = RoomCreatedEvent;

// Listen for incoming messages
eventBusChannel?.consume(queue, async (message: amqplib.ConsumeMessage | null) => {
  if (message !== null) {
    const { type, data }: Event = JSON.parse(message.content.toString());

    console.log(`Received event of type ${type}`);

    switch (type) {
      case "RoomCreated": {
        const { userId, title, about, duration, roomType, expired } = data;

        const queryText = "INSERT INTO rooms(userId, title, about, duration, roomType, expired) VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
        const queryValues = [userId, title, about, duration, roomType, expired];

        try {
          client.query(queryText, queryValues).then((res) => {
            console.log(res.rows[0]);
          });
        } catch (err) {
          console.log(err);
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

    const roomQueryResults = await client.query("SELECT * FROM rooms WHERE id=$1", [roomId]).then((res) => res.rows);

    if (roomQueryResults.length !== 1) {
      return res.status(400).send({ error: `Room with id ${roomId} does not exist!` });
    }

    const roomData: RoomData = roomQueryResults[0];

    if (roomData.expired) {
      return res.status(400).send({ error: `Room with id ${roomId} is expired!` });
    }

    const queryText = "INSERT INTO messages(roomId, content) VALUES($1, $2) RETURNING *";
    const queryValues = [roomId, content];

    try {
      client.query(queryText, queryValues).then((res) => {
        console.log(res.rows[0]);
      });

      const event: Buffer = Buffer.from(JSON.stringify({ type: "MessageCreated", data: req.body }));
      eventBusChannel?.publish("event-bus", "message-events", event);

      res.send(`Sent event of type MessageCreated`);
    } catch (err) {
      res.status(500).send({ error: err });
    }
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

app.listen(4002, () => {
  console.log("Listening on port 4002");
});
