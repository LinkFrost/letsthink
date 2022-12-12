import amqplib from "amqplib";
import type { EventKeys } from "../types/events.js";

export default async (queue: string, eventKeys: EventKeys[]) => {
  // Connect to rabbitmq, create a channel
  const eventBusConnection = await amqplib.connect("amqp://event-bus:5672");
  const eventBusChannel = await eventBusConnection.createChannel();
  const exchange = "event-bus";

  // Create exchange
  eventBusChannel.assertExchange(exchange, "direct", {
    durable: false,
  });

  // Create queue for service
  eventBusChannel.assertQueue(queue);

  // Subscribe to each event key
  eventKeys.forEach((key: string) => {
    eventBusChannel.bindQueue(queue, exchange, key);
  });

  return { eventBusChannel };
};
