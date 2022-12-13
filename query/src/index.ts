import initRabbit from "./utils/initRabbit.js";
import initMongo from "./utils/initMongo.js";
import initExpress from "./utils/initExpress.js";
import { auth } from "./utils/initExpress.js";

import type {
  MessageModerated,
  MessageVoted,
  PollVoted,
  RoomCreated,
  RoomExpired,
  PollCreated,
  RoomVisualized,
  MessageCreated,
  UserCreated,
} from "./types/events.js";

const { eventBusChannel } = await initRabbit("query", [
  "RoomCreated",
  "RoomExpired",
  "RoomVisualized",
  "MessageVoted",
  "MessageModerated",
  "PollVoted",
  "PollCreated",
  "MessageCreated",
  "UserCreated",
]);

const { mongoCollectionRoom, mongoCollectionUsers } = await initMongo();
const { app } = initExpress(4011);

type Event = RoomCreated | PollCreated | PollVoted | MessageVoted | MessageModerated | RoomVisualized | RoomExpired | MessageCreated | UserCreated;

// Listen for incoming messages
eventBusChannel?.consume("query", async (message) => {
  if (message !== null) {
    const { key, data }: Event = JSON.parse(message.content.toString());

    console.log(`Received event of type ${key}`);

    switch (key) {
      case "RoomCreated": {
        // RoomData insert room, add expired=false
        const roomData = { ...data, expired: false };
        const related = roomData.room_type === "message" ? { messages: [] } : { poll_options: [] };

        await mongoCollectionRoom.insertOne({ ...roomData, ...related });
      }
      case "RoomExpired": {
        // change expired flag with roomId
        const roomData = { ...data };
        await mongoCollectionRoom.updateOne({ id: roomData.id }, { $set: { expired: true } });
        break;
      }
      case "MessageVoted": {
        // get back message id and room id, update message in room object with votes
        const messageData = { ...data };
        await mongoCollectionRoom.updateOne({ id: messageData.room_id, "messages.id": messageData.id }, { $set: { "messages.$.votes": messageData.votes } });
        break;
      }
      case "PollVoted": {
        // get back polls id and room id, update polls in room object with votes
        const pollData = { ...data };
        await mongoCollectionRoom.updateOne({ id: pollData.room_id, "poll_options.id": pollData.id }, { $set: { "poll_options.$.votes": pollData.votes } });
        break;
      }
      case "PollCreated": {
        // get array of poll options and insert each into correct room
        const pollData = { ...data };
        pollData.poll_options = pollData.poll_options.map((cur) => ({ ...cur, votes: 0 }));
        await mongoCollectionRoom.updateOne({ id: pollData.room_id }, { $set: { poll_options: pollData.poll_options } });
        break;
      }
      case "MessageCreated": {
        // get message and add to room
        const messageData = { ...data, votes: 0 };
        await mongoCollectionRoom.updateOne({ id: messageData.room_id }, { $push: { messages: messageData } });
        break;
      }
      case "UserCreated": {
        const userData = { ...data };
        await mongoCollectionUsers.insertOne({ ...userData });
        break;
      }
    }

    eventBusChannel.ack(message);
  }
});

const fetchRoom = async (id: string) => {
  const room = await mongoCollectionRoom.findOne({ id: id });

  return room;
};

const fetchRoomsByUser = async (id: string) => {
  const rooms = await mongoCollectionRoom.find({ user_id: id }).toArray();

  return rooms;
};

app.get("/query/rooms/:room_id", async (req, res) => {
  try {
    const { room_id } = req.params;
    const room = await fetchRoom(room_id);

    return res.status(200).send(room);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
});

app.get("/query/rooms/user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const rooms = await fetchRoomsByUser(user_id);

    return res.status(200).send(rooms);
  } catch (err) {
    res.status(500).send({ error: err });
  }
});
