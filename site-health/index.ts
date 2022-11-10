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

interface RoomCreatedEvent {
  type: "RoomCreated";
  data: {
    roomType: string;
    userId: string;
    title: string;
    description: string;
  };
}

interface MessageCreatedEvent {
  type: "MessageCreated";
  data: {
    userId: string;
    roomId: string;
    content: string;
  };
}

type Event = RoomCreatedEvent | MessageCreatedEvent;

// Listen for incoming messages
eventBusChannel.consume("site-health", (message) => {
  if (message !== null) {
    const { type, data }: Event = JSON.parse(message.content.toString());

    switch (type) {
      case "RoomCreated": {
        console.log(`A ${data.roomType} room named ${data.title} was created by user with id ${data.userId}`);
        break;
      }
      case "MessageCreated": {
        console.log(data);
        console.log(`A message was created in room ${data.roomId} with the following content: ${data.content}`);
        break;
      }
    }

    // acknowledge the message to the queue
    eventBusChannel.ack(message);
  }
});
