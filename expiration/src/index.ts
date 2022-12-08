import initRabbit from "./utils/initRabbit.js";

const { eventBusChannel } = await initRabbit("expiration", ["RoomCreated"]);

// Listen for incoming messages
eventBusChannel.consume("expiration", (message) => {
  if (message === null) return;

  const { key, data } = JSON.parse(message.content.toString());

  if (message.fields.routingKey !== key) return;

  console.log(`Received event of type ${key}`);

  // switch (key) {
  //   case "RoomCreated":
  //     console.log(data);
  //     break;
  // }

  eventBusChannel.ack(message);
});
