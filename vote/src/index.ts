import express from "express";
import initRabbit from "./initRabbit.js";
import type { PollVoted, MessageVoted } from "./events.js";

const { eventBusChannel } = await initRabbit("vote", ["PollVoted", "MessageVoted"]);

type ConsumeMessage = PollVoted | MessageVoted;

// Listen for incoming messages
eventBusChannel.consume("vote", (message) => {
  if (message === null) return;

  const { key, data }: ConsumeMessage = JSON.parse(message.content.toString());

  if (message.fields.routingKey !== key) return;

  switch (key) {
    case "PollVoted":
      console.log(data);
      break;
    case "MessageVoted":
      console.log(data);
      break;
  }

  eventBusChannel.ack(message);
});
