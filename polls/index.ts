import amqplib from "amqplib";

const eventBusConnection = await amqplib.connect("amqp://event-bus:5672");

const eventBusChannel = await eventBusConnection.createChannel();

eventBusChannel.assertQueue("room-events");

eventBusChannel?.consume("room-events", (message: amqplib.ConsumeMessage | null) => {
  if (message !== null) {
    const { type, data } = JSON.parse(message.content.toString());

    if (type === "RoomCreated") {
      console.log(`A room named ${data.name} was created`);
    }

    eventBusChannel.ack;
  }
});
