import initRabbit from "./utils/initRabbit.js";

const queue = "visualizer";

const { eventBusChannel } = await initRabbit(queue, ["RoomCreated", "RoomExpired"]);

// Listen for incoming messages
eventBusChannel?.consume(queue, (message) => {
  if (message !== null) {
    const { key, data } = JSON.parse(message.content.toString());

    switch (key) {
      default:
      // Insert logic for various events here depending on the type and data
      // Case for each event type
    }

    eventBusChannel.ack(message);
  }
});
