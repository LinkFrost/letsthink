import express from "express";
import pg from "pg";
import cors from "cors";
import z from "zod";
import initRabbit from "./initRabbit.js";
import type { MessageCreated, RoomData } from "./events.js";

const queue = "messages";

const { eventBusChannel, confirmChannel } = await initRabbit(queue, ["RoomCreated", "RoomExpired"]);

// Connect to service specific database
const pgClient = new pg.Pool({
  user: "postgres",
  password: "postgres",
  host: "messages-db",
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
        const { id, room_type } = data;

        if (room_type === "message") {
          const queryText = "INSERT INTO rooms(id) VALUES($1) RETURNING *";
          const queryValues = [id];

          pgClient.query(queryText, queryValues);
        }

        break;
      }

      case "RoomExpired": {
        const { room_id, room_type } = data;

        if (room_type === "message") {
          const queryText = "DELETE FROM rooms WHERE id=$1";
          const queryValues = [room_id];

          pgClient.query(queryText, queryValues);
        }

        break;
      }
    }

    eventBusChannel.ack(message);
  }
});

const app = express();
app.use(express.json());
app.use(cors());

app.post("/messages", async (req, res) => {
  const reqBody = z.object({
    roomId: z.string(),
    content: z.string(),
  });

  try {
    // Validate body
    reqBody.parse(req.body);

    const { room_id, content } = req.body;

    // Check if given roomId matches a valid room and if that room is expired
    const roomQueryResults = await pgClient.query("SELECT * FROM rooms WHERE id=$1", [room_id]).then((res) => res.rows);

    if (roomQueryResults.length !== 1) {
      return res.status(400).send({ error: `Room with id ${room_id} does not exist!` });
    }

    const roomData: RoomData = roomQueryResults[0];

    if (roomData.expired) {
      return res.status(400).send({ error: `Room with id ${room_id} is expired!` });
    }

    const queryText = "INSERT INTO messages(roomId, content) VALUES($1, $2) RETURNING *";
    const queryValues = [room_id, content];

    // Create message in database and send it through the event bus
    const result = await pgClient.query(queryText, queryValues);

    const event: MessageCreated = { key: "MessageCreated", data: result.rows[0] };
    confirmChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

    res.send(`Sent event of type MessageCreated`);
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

app.listen(4002, () => {
  console.log("Listening on port 4002");
});
