import express from "express";
import initRabbit from "./initRabbit.js";
import type { RoomExpired, RoomCreated } from "./events.js";

const { eventBusChannel } = await initRabbit("expiration", ["RoomCreated"]);

type ConsumeMessage = RoomCreated;

// Listen for incoming messages
eventBusChannel.consume("expiration", (message) => {
  if (message === null) return;

  const { key, data }: ConsumeMessage = JSON.parse(message.content.toString());

  if (message.fields.routingKey !== key) return;

  switch (key) {
    case "RoomCreated":
      console.log(data);
      break;
  }

  eventBusChannel.ack(message);
});
