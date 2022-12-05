import * as dotenv from "dotenv";
dotenv.config();

import initRabbit from "./utils/initRabbit.js";
import initPostgres from "./utils/initPostgres.js";
import initExpress from "./utils/initExpress.js";
import z from "zod";
import type { PollVoted, MessageVoted, RoomCreated, RoomExpired, MessageCreated, PollCreated } from "./types/events.js";

// initialize rabbitmq, postgres, and express
const eventBusChannel = await initRabbit("vote", ["PollVoted", "MessageVoted"]);
const postgres = await initPostgres("vote-db");
const app = initExpress(4012);

type ConsumeMessage = RoomCreated | RoomExpired | MessageCreated | PollCreated;

// Listen for incoming messages
eventBusChannel.consume("vote", async (message) => {
  if (message === null) return;

  const { key, data }: ConsumeMessage = JSON.parse(message.content.toString());

  if (message.fields.routingKey !== key) return;

  console.log(`vote service received ${key}`);

  try {
    let query: string;
    let queryValues: string[];

    switch (key) {
      case "PollCreated":
        data.poll_options.forEach(async (curr) => {
          query = "INSERT INTO messages (id) VALUES ($1)";
          queryValues = [curr.id];
          await postgres.query(query, queryValues);
        });
        break;
      case "RoomCreated":
        query = "INSERT INTO rooms (id) VALUES ($1)";
        queryValues = [data.id];
        await postgres.query(query, queryValues);
        break;
      case "RoomExpired":
        query = "DELETE FROM rooms WHERE id=$1";
        queryValues = [data.id];
        await postgres.query(query, queryValues);
        break;
      case "MessageCreated":
        query = "INSERT INTO messages (id) VALUES ($1)";
        queryValues = [data.id];
        await postgres.query(query, queryValues);
        break;
    }
  } catch (err) {
    eventBusChannel.nack(message);
  }

  eventBusChannel.ack(message);
});

app.post("/messages/:id", async (req, res) => {
  const reqBody = z.object({
    room_id: z.string(),
  });

  try {
    // validate body
    reqBody.parse(req.body);
    const message_id = req.params.id;
    const { room_id } = req.body;

    // check if room is expired (if it exists in rooms)
    let query = "SELECT * FROM rooms WHERE id=$1 RETURNING *";
    let queryValues = [room_id];
    let result = await postgres.query(query, queryValues);

    // room is expired
    if (result.rows.length === 0) {
      return res.status(400).json({ error: `room with id ${room_id} is expired or does not exist` });
    }

    // room is not expired
    query = "UPDATE messages SET votes=votes+1 WHERE id=$1 RETURNING *";
    queryValues = [message_id];
    result = await postgres.query(query, queryValues);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: `message with id ${message_id} does not exist` });
    }

    // send event to rabbitMQ
    const event: MessageVoted = { key: "MessageVoted", data: result.rows[0] };
    eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

    //
    res.send(result.rows[0]);
  } catch (err) {
    res.send({ error: err });
  }
});

app.post("/polls/:id", async (req, res) => {
  const reqBody = z.object({
    room_id: z.string(),
  });

  try {
    // validate body
    reqBody.parse(req.body);
    const option_id = req.params.id;
    const { room_id } = req.body;

    // check if room is expired (if it exists in rooms)
    let query = "SELECT * FROM rooms WHERE id=$1 RETURNING *";
    let queryValues = [room_id];
    let result = await postgres.query(query, queryValues);

    // room is expired
    if (result.rows.length === 0) {
      return res.status(400).json({ error: `room with id ${room_id} is expired or does not exist` });
    }

    // room is not expired
    query = "UPDATE poll_options SET votes=votes+1 WHERE id=$1 RETURNING *";
    queryValues = [option_id];
    result = await postgres.query(query, queryValues);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: `poll option with id ${option_id} does not exist` });
    }

    // send event to rabbitMQ
    const event: PollVoted = { key: "PollVoted", data: result.rows[0] };
    eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

    //
    res.send(result.rows[0]);
  } catch (err) {
    res.send({ error: err });
  }
});
