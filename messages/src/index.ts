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
        const { id, userid, title, about, createdate, duration, roomtype } = data;

        if (roomtype === "message") {
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

app.post("/messages", async (req, res) => {
  const reqBody = z.object({
    roomId: z.string(),
    content: z.string(),
  });

  try {
    // Validate body
    reqBody.parse(req.body);

    const { roomId, content } = req.body;

    // Check if given roomId matches a valid room and if that room is expired
    const roomQueryResults = await pgClient.query("SELECT * FROM rooms WHERE id=$1", [roomId]).then((res) => res.rows);

    if (roomQueryResults.length !== 1) {
      return res.status(400).send({ error: `Room with id ${roomId} does not exist!` });
    }

    const roomData: RoomData = roomQueryResults[0];

    if (roomData.expired) {
      return res.status(400).send({ error: `Room with id ${roomId} is expired!` });
    }

    const queryText = "INSERT INTO messages(roomId, content) VALUES($1, $2) RETURNING *";
    const queryValues = [roomId, content];

    // Create message in database and send it through the event bus
    pgClient.query(queryText, queryValues);

    const event: MessageCreated = { key: "MessageCreated", data: req.body };
    confirmChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

    res.send(`Sent event of type MessageCreated`);
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

app.post("/signup", async (req, res) => {
  try {
    // Validate body
    const { id, email, username, password } = req.body;

    const event = { key: "UserCreated", data: req.body };
    confirmChannel.publish("event-bus", "UserCreated", Buffer.from(JSON.stringify(event)));

    res.send(`Sent event of type UserCreated`);
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

app.listen(4002, () => {
  console.log("Listening on port 4002");
});
