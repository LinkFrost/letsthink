import express from "express";
import pg from "pg";
import cors from "cors";
import z from "zod";
import initRabbit from "./initRabbit.js";
import type { RoomCreated } from "./events.js";

const queue = "rooms";

const { eventBusChannel, confirmChannel } = await initRabbit(queue, []);

const pgClient = new pg.Pool({
  user: "postgres",
  password: "postgres",
  host: "rooms-db",
  port: 5432,
});

await pgClient.connect();

const app = express();
app.use(express.json());
app.use(cors());

app.post("/rooms", async (req, res) => {
  const reqBody = z.object({
    userId: z.string(),
    title: z.string(),
    about: z.string(),
    duration: z.number(),
    roomType: z.literal("message") || z.literal("poll"),
  });

  try {
    // Validate body
    reqBody.parse(req.body);

    // Create query information
    const { userId, title, about, duration, roomType } = req.body;
    const query = "INSERT INTO rooms(userId, title, about, duration, roomType) VALUES($1, $2, $3, $4, $5) RETURNING *";
    const queryValues = [userId, title, about, duration, roomType];

    // run the query
    const result = await pgClient.query(query, queryValues);

    // send event to rabbitMQ
    const event: RoomCreated = { key: "RoomCreated", data: result.rows[0] };
    confirmChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

    // Send copy of the room created back to client
    res.send(result.rows[0]);
  } catch (err) {
    res.send({ error: err });
  }
});

app.listen(4001, () => {
  console.log("rooms service listening on port 4001");
});
