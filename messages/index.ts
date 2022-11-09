import amqplib from "amqplib";
import express from "express";

const eventBusConnection = await amqplib.connect("amqp://event-bus:5672");
const eventBusChannel = await eventBusConnection.createChannel();

eventBusChannel.assertExchange("event-bus", "direct", {
  durable: false,
});

eventBusChannel.assertQueue("messages");

const eventTypes: string[] = ["room-events"];

eventTypes.forEach((event) => {
  eventBusChannel.bindQueue("messages", "event-bus", event);
});

eventBusChannel?.consume("messages", (message: amqplib.ConsumeMessage | null) => {
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

const app = express();
app.use(express.json());

app.post("/messages", async (req, res) => {
  try {
    const event = Buffer.from(JSON.stringify({ type: "MessageCreated", data: req.body }));
    eventBusChannel?.publish("event-bus", "message-events", event);
    res.send(`Sent event of type MessageCreated`);
  } catch (err) {
    res.send({ error: err });
  }
});

app.listen(4002, () => {
  console.log("Listening on port 4002");
});
