import amqplib from "amqplib";

const eventBusConnection = await amqplib.connect("amqp://event-bus:5672");
const eventBusChannel = await eventBusConnection.createChannel();

eventBusChannel.assertExchange("event-bus", "direct", {
  durable: false,
});

const eventTypes: string[] = ["room-events", "message-events"];

eventBusChannel.assertQueue("site-health");

eventTypes.forEach((event) => {
  eventBusChannel.bindQueue("site-health", "event-bus", event);
});

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
