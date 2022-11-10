import amqplib from "amqplib";

// Connect to rabbitmq, create a channel
const eventBusConnection: amqplib.Connection = await amqplib.connect("amqp://event-bus:5672");
const eventBusChannel: amqplib.Channel = await eventBusConnection.createChannel();

// Create exchange
eventBusChannel.assertExchange("event-bus", "direct", {
  durable: false,
});

const eventKeys: string[] = ["room-events"];

// Create queue for service
eventBusChannel.assertQueue("polls");

// Subscribe to each event key
eventKeys.forEach((key: string) => {
  eventBusChannel.bindQueue("polls", "event-bus", key);
});

// Listen for incoming messages
eventBusChannel?.consume("polls", (message: amqplib.ConsumeMessage | null) => {
  if (message !== null) {
    const { type, data } = JSON.parse(message.content.toString());

    if (message.fields.routingKey === "room-events") {
      switch (type) {
        case "RoomCreated": {
          console.log(`A ${data.type} room named ${data.title} was created by user with id ${data.userId}`);
        }
      }
    }

    eventBusChannel.ack(message);
  }
});
