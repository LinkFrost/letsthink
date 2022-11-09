import amqplib from "amqplib";
import express from "express";

const eventBusConnection = await amqplib.connect("amqp://event-bus:5672");

const eventBusChannel = await eventBusConnection.createChannel();

eventBusChannel.assertQueue("room-events");

const app = express();

app.post("/rooms", async (req, res) => {
  try {
    const event = Buffer.from(JSON.stringify({ type: "RoomCreated", data: { name: "My Room" } }));
    eventBusChannel?.sendToQueue("room-events", event);
    res.send("Success!");
  } catch (err) {
    res.send({ error: err });
  }
});

app.listen(4001, () => {
  console.log("Listening on port 4001");
});
