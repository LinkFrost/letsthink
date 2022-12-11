import initRabbit from "./utils/initRabbit.js";
import initPostgres from "./utils/initPostgres.js";
import initExpress from "./utils/initExpress.js";
import z from "zod";
import type { RoomCreated } from "./types/events.js";

// initialize rabbitmq, postgres, and express
const { eventBusChannel } = await initRabbit("rooms", []);
const { query } = initPostgres("rooms-db");
const { app } = initExpress(4001);

app.post("/rooms", async (req, res) => {
  const reqBody = z.object({
    user_id: z.string(),
    title: z.string(),
    about: z.string(),
    room_type: z.literal("message").or(z.literal("poll")),
    duration: z.number().int(),
  });

  try {
    try {
      // validate body
      reqBody.parse(req.body);
    } catch (err) {
      return res.status(400).send({ error: err });
    }

    // create query information
    const { user_id, title, about, room_type, duration } = req.body;
    const queryStr = "INSERT INTO rooms(user_id, title, about, room_type, duration) VALUES($1, $2, $3, $4, $5) RETURNING *";
    const queryValues = [user_id, title, about, room_type, duration];

    // run the query
    const result = await query<Omit<RoomCreated["data"], "expire_date">>(queryStr, queryValues);

    const insertedRoom = result.rows[0];
    const expire_date = new Date(new Date(insertedRoom.create_date).getTime() + insertedRoom.duration * 60 * 1000).toISOString();
    const eventData = { expire_date, ...insertedRoom };

    // send event to rabbitMQ
    const event: RoomCreated = { key: "RoomCreated", data: eventData };
    eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

    // once this is sent, client should assume room id exists but does not know if query/other services are finished handling RoomCreated
    return res.status(201).send(eventData);
  } catch (err) {
    return res.status(500).send({ error: err });
  }
});
