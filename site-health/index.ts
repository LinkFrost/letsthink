import amqplib from "amqplib";

// Connect to rabbitmq, create a channel
const eventBusConnection: amqplib.Connection = await amqplib.connect("amqp://event-bus:5672");
const eventBusChannel: amqplib.Channel = await eventBusConnection.createChannel();

// Create exchange
eventBusChannel.assertExchange("event-bus", "direct", {
  durable: false,
});

const eventKeys: string[] = ["room-events", "message-events"];

// Create queue for service
eventBusChannel.assertQueue("site-health");

// Subscribe to each event key
eventKeys.forEach((key: string) => {
  eventBusChannel.bindQueue("site-health", "event-bus", key);
});

// Listen for incoming messages
eventBusChannel?.consume("site-health", (message: amqplib.ConsumeMessage | null) => {
  if (message !== null) {
    const { type, data } = JSON.parse(message.content.toString());

    switch (message.fields.routingKey) {
      case "room-events": {
        switch (type) {
          case "RoomCreated": {
            console.log(`A ${data.type} room named ${data.title} was created by user with id ${data.userId}`);
          }
        }
        break;
      }
      case "message-events": {
        switch (type) {
          case "MessageCreated": {
            console.log(`A message was created in room ${data.roomId} with the following content: ${data.content}`);
          }
        }
        break;
      }
    }
    eventBusChannel.ack(message);
  }
});
