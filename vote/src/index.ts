import amqplib from "amqplib";
import express from "express";

// Connect to RabbitMQ and create a communication channel
const eventBusConnection = await amqplib.connect("amqp://event-bus:5672");
const eventBusChannel = await eventBusConnection.createChannel();

const queue = "vote";
const exchange = "event-bus";

// Assert exchange
eventBusChannel.assertExchange(exchange, "direct", {
  durable: false,
});

// Assert queue
eventBusChannel.assertQueue(queue);

const eventKeys = ["room-events", "expiration-events"];

// Subscribe to each event key
eventKeys.forEach((key: string) => {
  eventBusChannel.bindQueue(queue, exchange, key);
});

type Event = any; // TODO types for each event

// Listen for incoming messages
eventBusChannel.consume(queue, (message) => {
  if (message !== null) {
    const { type, data }: Event = JSON.parse(message.content.toString());

    switch (type) {
      default:
      // Insert logic for various events here depending on the type
    }

    eventBusChannel.ack(message);
  }
});

const app = express();
app.use(express.json());
