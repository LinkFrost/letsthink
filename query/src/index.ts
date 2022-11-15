import amqplib from "amqplib";
import express from "express";

// Connect to rabbitmq, create a channel
const eventBusConnection = await amqplib.connect("amqp://event-bus:5672");
const eventBusChannel = await eventBusConnection.createChannel();

const queue: string = "query";
const exchange: string = "event-bus";

// Create exchange
eventBusChannel.assertExchange(exchange, "direct", {
  durable: false,
});

// Create queue for service
eventBusChannel.assertQueue(queue);

const eventKeys: string[] = ["room-events", "poll-events", "vote-events", "moderator-events", "visualizer-events", "expiration-events"];

// Subscribe to each event key
eventKeys.forEach((key: string) => {
  eventBusChannel.bindQueue(queue, exchange, key);
});

type Event = any;

const app = express();
app.use(express.json());

// Listen for incoming messages
eventBusChannel?.consume(queue, (message: amqplib.ConsumeMessage | null) => {
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
