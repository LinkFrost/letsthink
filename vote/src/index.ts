import initRabbit from "./utils/initRabbit.js";
import initPostgres from "./utils/initPostgres.js";
import initExpress from "./utils/initExpress.js";
import z from "zod";
import type { PollVoted, MessageVoted, RoomCreated, RoomExpired, MessageCreated, PollCreated } from "./types/events.js";

// initialize rabbitmq, postgres, and express
const { eventBusChannel } = await initRabbit("vote", ["PollCreated", "MessageCreated", "RoomCreated", "RoomExpired"]);
const { query } = initPostgres("vote-db");
const { app } = initExpress(4012);

type ConsumeMessage = PollCreated | MessageCreated | RoomCreated | RoomExpired;

// Listen for incoming messages
eventBusChannel.consume("vote", async (message) => {
  if (message === null) return;

  const { key, data }: ConsumeMessage = JSON.parse(message.content.toString());
  console.log(`vote service received ${key}`);

  try {
    let queryStr: string;
    let queryValues: string[];

    switch (key) {
      case "PollCreated":
        data.poll_options.forEach(async (curr) => {
          queryStr = "INSERT INTO messages (id) VALUES ($1)";
          queryValues = [curr.id];
          await query(queryStr, queryValues);
        });
        break;
      case "MessageCreated":
        queryStr = "INSERT INTO messages (id) VALUES ($1)";
        queryValues = [data.id];
        await query(queryStr, queryValues);
        break;
      case "RoomCreated":
        queryStr = "INSERT INTO rooms (id) VALUES ($1)";
        queryValues = [data.id];
        await query(queryStr, queryValues);
        break;
      case "RoomExpired":
        queryStr = "DELETE FROM rooms WHERE id=$1";
        queryValues = [data.id];
        await query(queryStr, queryValues);
        break;
    }
  } catch (err) {
    eventBusChannel.nack(message);
  }

  eventBusChannel.ack(message);
});

app.post("/messages", async (req, res) => {
  const reqBody = z.object({
    message_id: z.string(),
    room_id: z.string(),
  });

  try {
    try {
      reqBody.parse(req.body);
    } catch (err) {
      return res.status(400).send({ error: err });
    }

    const { message_id, room_id }: { message_id: string; room_id: string } = req.body;

    // check if room is expired (if it exists in rooms)
    let queryStr = "SELECT * FROM rooms WHERE id=$1";
    let queryValues = [room_id];
    const activeRooms = await query<{ id: string }>(queryStr, queryValues);

    // room is expired
    if (activeRooms.rows.length === 0) {
      return res.status(400).json({ error: `room with id ${room_id} is expired or does not exist` });
    }

    // room is not expired
    queryStr = "UPDATE messages SET votes=votes+1 WHERE id=$1 RETURNING *";
    queryValues = [message_id];
    const updatedMessage = await query<Omit<MessageVoted["data"], "room_id">>(queryStr, queryValues);

    if (updatedMessage.rows.length === 0) {
      return res.status(400).json({ error: `message with id ${message_id} does not exist` });
    }

    const eventData = { room_id, ...updatedMessage.rows[0] };

    // send event to rabbitMQ
    const event: MessageVoted = { key: "MessageVoted", data: eventData };
    eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

    return res.status(200).send(eventData);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
});

app.post("/polls", async (req, res) => {
  const reqBody = z.object({
    option_id: z.string(),
    room_id: z.string(),
  });

  try {
    try {
      reqBody.parse(req.body);
    } catch (err) {
      return res.status(400).send({ error: err });
    }

    const { option_id, room_id }: { option_id: string; room_id: string } = req.body;

    // check if room is expired (if it exists in rooms)
    let queryStr = "SELECT * FROM rooms WHERE id=$1";
    let queryValues = [room_id];
    const activeRooms = await query<{ id: string }>(queryStr, queryValues);

    // room is expired
    if (activeRooms.rows.length === 0) {
      return res.status(400).json({ error: `room with id ${room_id} is expired or does not exist` });
    }

    // room is not expired
    queryStr = "UPDATE poll_options SET votes=votes+1 WHERE id=$1 RETURNING *";
    queryValues = [option_id];
    const updatedPollOption = await query<Omit<PollVoted["data"], "room_id">>(queryStr, queryValues);

    if (updatedPollOption.rows.length === 0) {
      return res.status(400).json({ error: `poll option with id ${option_id} does not exist` });
    }

    const eventData = { room_id, ...updatedPollOption.rows[0] };

    // send event to rabbitMQ
    const event: PollVoted = { key: "PollVoted", data: eventData };
    eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

    return res.status(200).send(eventData);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
});
