import initRabbit from "./utils/initRabbit.js";
import initPostgres from "./utils/initPostgres.js";
import initExpress from "./utils/initExpress.js";
import z from "zod";
import type { RoomCreated } from "./types/events.js";

// initialize rabbitmq, postgres, and express
const eventBusChannel = await initRabbit("rooms", []);
const postgres = await initPostgres("rooms-db");
const app = initExpress(4001);

app.post("/rooms", async (req, res) => {
  const reqBody = z.object({
    user_id: z.string(),
    title: z.string(),
    about: z.string(),
    duration: z.number(),
    room_type: z.string(),
  });

  try {
    // validate body
    reqBody.parse(req.body);

    // create query information
    const { user_id, title, about, duration, room_type } = req.body;
    const query = "INSERT INTO rooms(user_id, title, about, duration, room_type) VALUES($1, $2, $3, $4, $5) RETURNING *";
    const queryValues = [user_id, title, about, duration, room_type];

    // run the query
    const result = await postgres.query(query, queryValues);

    // send event to rabbitMQ
    const event: RoomCreated = { key: "RoomCreated", data: result.rows[0] };
    eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

    // once this is sent, client should assume room id exists but does not know if query/other services are finished handling RoomCreated
    res.send(result.rows[0]);
  } catch (err) {
    res.send({ error: err });
  }
});
