import amqplib from "amqplib";
import express from "express";
// Connect to rabbitmq, create a channel
const eventBusConnection = await amqplib.connect("amqp://event-bus:5672");
const eventBusChannel = await eventBusConnection.createChannel();
const queue = "vote";
const exchange = "event-bus";
// Create exchange
eventBusChannel.assertExchange(exchange, "direct", {
    durable: false,
});
// Create queue for service
eventBusChannel.assertQueue(queue);
const eventKeys = ["room-events", "expiration-events"];
// Subscribe to each event key
eventKeys.forEach((key) => {
    eventBusChannel.bindQueue(queue, exchange, key);
});
// Listen for incoming messages
eventBusChannel?.consume(queue, (message) => {
    if (message !== null) {
        const { type, data } = JSON.parse(message.content.toString());
        switch (type) {
            default:
            // Insert logic for various events here depending on the type and data
            // Case for each event type
        }
        eventBusChannel.ack(message);
    }
});
const app = express();
app.use(express.json());
