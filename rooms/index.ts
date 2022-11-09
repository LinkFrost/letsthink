import amqplib from "amqplib";
import express from "express";

const eventBusConnection = await amqplib.connect("amqp://event-bus:5672");
const eventBusChannel = await eventBusConnection.createChannel();

eventBusChannel.assertExchange("event-bus", "direct", {
  durable: false,
});

eventBusChannel.assertQueue("rooms");

const app = express();
app.use(express.json());

app.post("/rooms", async (req, res) => {
  try {
    const event = Buffer.from(JSON.stringify({ type: "RoomCreated", data: req.body }));
    eventBusChannel?.publish("event-bus", "room-events", event);
    res.send(`Sent event of type RoomCreated`);
  } catch (err) {
    res.send({ error: err });
  }
});

app.listen(4001, () => {
  console.log("Listening on port 4001");
});
