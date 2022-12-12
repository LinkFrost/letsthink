import initRabbit from "./utils/initRabbit.js";
import initMongo from "./utils/initMongo.js";
import initExpress from "./utils/initExpress.js";
import { auth } from "./utils/initExpress.js";

import type { MessageModerated, MessageVoted, PollVoted, RoomCreated, RoomExpired, PollCreated, RoomVisualized, MessageCreated } from "./types/events.js";
import { ObjectId } from "mongodb";

const { eventBusChannel } = await initRabbit("query", [
  "RoomCreated",
  "RoomExpired",
  "RoomVisualized",
  "MessageVoted",
  "MessageModerated",
  "PollVoted",
  "PollCreated",
  "MessageCreated",
]);

const { mongoCollection } = await initMongo();

const app = initExpress(4011);

type Event = RoomCreated | PollCreated | PollVoted | MessageVoted | MessageModerated | RoomVisualized | RoomExpired | MessageCreated;

// {
//   id: room_id,
//   user_id: "fa74787c-352a-4956-8ef2-06513c651ecd",
//   title: "My Room",
//   about: "Just doing a quick little test poll",
//   duration: 5,
//   room_type: "poll",
//   expired: false,
//   poll_options: [
//     {
//       id: "05810ea1-2949-400c-b9a3-dc3667079ab2",
//       title: "Option A",
//       position: 1,
//       votes: 3,
//       room_id: "1678f74b-74d8-410c-8c91-4a029fad721f",
//     },
//   ],

// Listen for incoming messages
eventBusChannel?.consume("query", async (message) => {
  if (message !== null) {
    const { key, data }: Event = JSON.parse(message.content.toString());

    console.log(`Received event of type ${key}`);

    switch (key) {
      case "RoomCreated": {
        // RoomData insert room, add expired=false
        // const { id, user_id, title, about, duration, create_date, room_type } = data;
        const roomData = { ...data, expired: false };
        if (!["message", "poll"].includes(roomData.room_type)) return;
        const related = roomData.room_type === "message" ? { messages: [] } : { poll_options: [] };

        await mongoCollection.insertOne({ ...roomData, ...related });
      }
      case "RoomExpired": {
        // change expired flag with roomId
        const roomData = { ...data };
        await mongoCollection.updateOne({ id: roomData.id }, { $set: { expired: true } });
        break;
      }
      case "MessageVoted": {
        // get back message id and room id, update message in room object with votes
        const messageData = { ...data };
        await mongoCollection.updateOne({ id: messageData.room_id, "messages.id": messageData.id }, { $set: { "messages.$.votes": messageData.votes } });
        break;
      }
      case "PollVoted": {
        // get back polls id and room id, update polls in room object with votes
        const pollData = { ...data };
        await mongoCollection.updateOne({ id: pollData.room_id, "poll_options.id": pollData.id }, { $set: { "poll_options.$.votes": pollData.votes } });
        break;
      }
      case "PollCreated": {
        // get array of poll options and insert each into correct room
        const pollData = { ...data };
        pollData.poll_options = pollData.poll_options.map((cur) => ({ ...cur, votes: 0 }));
        await mongoCollection.updateOne({ id: pollData.room_id }, { $set: { poll_options: pollData.poll_options } });
        break;
      }
      case "MessageCreated": {
        // get message and add to room
        const messageData = { ...data, votes: 0 };
        await mongoCollection.updateOne({ id: messageData.room_id }, { $push: { messages: messageData } });
        break;
      }
    }

    eventBusChannel.ack(message);
  }
});

const fetchData = async () => {
  const findResult = (await mongoCollection.find().toArray()) as any[];

  return findResult[0];
};

app.get("/query", async (req, res) => {
  res.send(await fetchData());
});

app.get("/checkMongo", async (req, res) => {
  const viz = await mongoCollection.find({}).toArray();
  res.send(viz);
});
