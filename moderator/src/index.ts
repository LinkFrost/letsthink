import initRabbit from "./utils/initRabbit.js";

const queue = "moderator";

const { eventBusChannel } = await initRabbit(queue, ["RoomCreated", "RoomExpired"]);

// Listen for incoming messages
eventBusChannel.consume(queue, (message) => {
  if (message !== null) {
    const { key, data } = JSON.parse(message.content.toString());

    console.log(`Received event of type ${key}`);

    switch (key) {
      default:
      // Insert logic for various events here depending on the type and data
      // Case for each event type
    }

    eventBusChannel.ack(message);
  }
});
