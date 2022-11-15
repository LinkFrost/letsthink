import amqplib from "amqplib";
import express from "express";

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
    roomType: string;
    userId: string;
    title: string;
    description: string;
  };
}

type Event = RoomCreatedEvent;

// Listen for incoming messages
eventBusChannel?.consume(queue, (message: amqplib.ConsumeMessage | null) => {
  if (message !== null) {
    const { type, data }: Event = JSON.parse(message.content.toString());

    switch (type) {
      case "RoomCreated": {
        console.log(`A ${data.roomType} room named ${data.title} was created by user with id ${data.userId}`);
      }
    }

    eventBusChannel.ack(message);
  }
});

const app = express();
app.use(express.json());

app.post("/messages", async (req, res) => {
  try {
    const event: Buffer = Buffer.from(JSON.stringify({ type: "MessageCreated", data: req.body }));
    eventBusChannel?.publish("event-bus", "message-events", event);
    res.send(`Sent event of type MessageCreated`);
  } catch (err) {
    res.send({ error: err });
  }
});

app.listen(4002, () => {
  console.log("Listening on port 4002");
});
