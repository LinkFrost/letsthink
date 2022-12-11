import { RoomCreated, RoomExpired } from "./types/events.js";
import initRabbit from "./utils/initRabbit.js";
import initRedis from "./utils/initRedis.js";
import cron from "cron";

const { eventBusChannel } = await initRabbit("expiration", ["RoomCreated"]);
const { redisClient } = await initRedis();

type ConsumeMessage = RoomCreated;

// Listen for incoming messages
eventBusChannel.consume("expiration", async (message) => {
  if (message === null) return;

  const { key, data }: ConsumeMessage = JSON.parse(message.content.toString());
  console.log(`expiration service received ${key}`);

  try {
    switch (key) {
      case "RoomCreated":
        await redisClient.sAdd(data.expire_date, data.id);
        break;
    }
  } catch (err) {
    eventBusChannel.nack(message);
  }

  eventBusChannel.ack(message);
});

async function checkForExpiration() {
  const currentTime = new Date();
  currentTime.setSeconds(0);
  currentTime.setMilliseconds(0);

  try {
    const expired = await redisClient.sMembers(currentTime.toISOString());

    for (const expiredRoom of expired) {
      const event: RoomExpired = { key: "RoomExpired", data: { id: expiredRoom } };
      eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));
    }

    await redisClient.del(currentTime.toISOString());
  } catch (error) {
    console.log(error);
  }
}

new cron.CronJob("* * * * *", checkForExpiration, null, true, "utc");
