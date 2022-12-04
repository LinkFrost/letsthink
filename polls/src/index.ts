import express from "express";
import pg from "pg";
import cors from "cors";
import z from "zod";
import initRabbit from "./initRabbit.js";
import type { PollCreated, PollData, RoomData } from "./events.js";

const queue = "polls";

const { eventBusChannel, confirmChannel } = await initRabbit(queue, ["RoomCreated", "RoomExpired"]);

// Connect to service specific database
const pgClient = new pg.Pool({
  user: "postgres",
  password: "postgres",
  host: "polls-db",
  port: 5432,
});

await pgClient.connect();

// Listen for incoming messages
eventBusChannel.consume(queue, async (message) => {
  if (message !== null) {
    const { key, data } = JSON.parse(message.content.toString());

    console.log(`Received event of type ${key}`);

    switch (key) {
      case "RoomCreated": {
        const { id, userid, title, about, createdate, duration, roomtype } = data;

        if (roomtype === "poll") {
          const queryText = "INSERT INTO rooms(id, userid, title, about, createdate, duration, roomtype) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *";
          const queryValues = [id, userid, title, about, createdate, duration, roomtype];

          pgClient.query(queryText, queryValues);
        }

        break;
      }

      case "RoomExpired": {
        const { roomId } = data;

        const queryText = "UPDATE rooms SET expired=$1 WHERE id=$2";
        const queryValues = [true, roomId];

        pgClient.query(queryText, queryValues);

        break;
      }
    }

    eventBusChannel.ack(message);
  }
});

const app = express();
app.use(express.json());
app.use(cors());

app.post("/polls", async (req, res) => {
  const reqBody = z.object({
    roomId: z.string(),
    pollOptions: z.array(
      z.object({
        title: z.string(),
        optionNumber: z.number(),
      })
    ),
  });

  try {
    // Validate body
    reqBody.parse(req.body);

    const { roomId, pollOptions } = req.body;

    // Check if given roomId matches a valid room and if that room is expired
    const roomQueryResults = await pgClient.query("SELECT * FROM rooms WHERE id=$1", [roomId]).then((res) => res.rows);

    if (roomQueryResults.length !== 1) {
      return res.status(400).send({ error: `Room with id ${roomId} does not exist!` });
    }

    const roomData: RoomData = roomQueryResults[0];

    if (roomData.expired) {
      return res.status(400).send({ error: `Room with id ${roomId} is expired!` });
    }

    const pollQueryText = "INSERT INTO polls(roomId) VALUES($1) RETURNING *";
    const pollQueryValues = [roomId];

    // Create poll in database
    const pollQuery: PollData = await pgClient.query(pollQueryText, pollQueryValues).then((res) => res.rows[0]);
    const pollId = pollQuery.id;

    let createdOptions = [];

    for (const pollOption of pollOptions) {
      const optionQueryText = "INSERT INTO poll_options(title, optionnumber, pollid) VALUES($1, $2, $3) RETURNING *";
      const optionQueryValues = [pollOption.title, pollOption.optionNumber, pollId];

      const createdOption = await pgClient.query(optionQueryText, optionQueryValues).then((res) => res.rows[0]);
      createdOptions.push(createdOption);
    }

    const event: PollCreated = { key: "PollCreated", data: { id: pollQuery.id, roomId: pollQuery.roomid, pollOptions: createdOptions } };
    confirmChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

    res.send(`Sent event of type PollCreated`);
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

app.listen(4003, () => {
  console.log("Listening on port 4003");
});
