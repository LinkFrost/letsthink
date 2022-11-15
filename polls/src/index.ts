import amqplib from "amqplib";

// Connect to rabbitmq, create a channel
const eventBusConnection: amqplib.Connection = await amqplib.connect("amqp://event-bus:5672");
const eventBusChannel: amqplib.Channel = await eventBusConnection.createChannel();

const queue: string = "polls";
const exchange: string = "event-bus";

// Create exchange
eventBusChannel.assertExchange(exchange, "direct", {
  durable: false,
});

const eventKeys: string[] = ["room-events", "vote-events", "expiration-events"];

// Create queue for service
eventBusChannel.assertQueue(queue);

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
