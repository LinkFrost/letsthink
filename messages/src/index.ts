import initRabbit from "./utils/initRabbit.js";
import initPostgres from "./utils/initPostgres.js";
import initExpress from "./utils/initExpress.js";
import z from "zod";
import type { MessageCreated } from "./types/events.js";

const queue = "messages";

const { eventBusChannel } = await initRabbit(queue, ["RoomCreated", "RoomExpired"]);
const pgClient = await initPostgres("messages-db");
const app = initExpress(4002);

// Listen for incoming messages
eventBusChannel.consume(queue, async (message) => {
  if (message !== null) {
    const { key, data } = JSON.parse(message.content.toString());

    console.log(`Received event of type ${key}`);

    try {
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
    } catch (err) {
      eventBusChannel.nack(message);
    }

    eventBusChannel.ack(message);
  }
});

app.post("/messages", async (req, res) => {
  const reqBody = z.object({
    room_id: z.string(),
    content: z.string(),
  });

  try {
    // Validate body
    reqBody.parse(req.body);

    const { room_id, content } = req.body;

    // Check if given roomId matches a valid room and if that room is expired
    const roomQueryResults = await pgClient.query("SELECT * FROM rooms WHERE id=$1", [room_id]).then((res) => res.rows);

    if (roomQueryResults.length !== 1) {
      return res.status(400).send({ error: `Room with id ${room_id} does not exist or is expired!` });
    }

    const queryText = "INSERT INTO messages(roomId, content) VALUES($1, $2) RETURNING *";
    const queryValues = [room_id, content];

    // Create message in database and send it through the event bus
    const result = await pgClient.query(queryText, queryValues);

    const event: MessageCreated = { key: "MessageCreated", data: result.rows[0] };
    eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

    res.send(`Sent event of type MessageCreated`);
  } catch (err) {
    res.status(500).send({ error: err });
  }
});
