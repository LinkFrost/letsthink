import initRabbit from "./utils/initRabbit.js";
import initPostgres from "./utils/initPostgres.js";
import initExpress from "./utils/initExpress.js";
import z from "zod";
import type { HTTPRequest, MessageCreated } from "./types/events.js";
import { Channel } from "amqplib";

const publishHTTPEvent = (eventBus: Channel, code: number) => {
  const event: HTTPRequest = { key: "HTTPRequest", data: { status: code } };
  eventBus.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));
};

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
          const { id } = data;

          const queryText = "DELETE FROM rooms WHERE id=$1";
          const queryValues = [id];
          pgClient.query(queryText, queryValues);

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
    content: z.string().min(1).max(150),
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

    const moderatorRes = await fetch("http://moderator:4004/moderate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: content }),
    });

    const moderatorData = await moderatorRes.json();

    if (moderatorData.status === "accepted") {
      const queryText = "INSERT INTO messages(room_id, content) VALUES($1, $2) RETURNING *";
      const queryValues = [room_id, content];

      // Create message in database and send it through the event bus
      const result = await pgClient.query(queryText, queryValues);

      const event: MessageCreated = { key: "MessageCreated", data: result.rows[0] };
      eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));
      publishHTTPEvent(eventBusChannel, 200);

      res.status(200).json({ status: moderatorData.status, data: result.rows[0] });
    } else {
      publishHTTPEvent(eventBusChannel, 200);
      res.status(200).json({ status: moderatorData.status, data: [...moderatorData.invalidWords] });
    }
  } catch (err) {
    publishHTTPEvent(eventBusChannel, 500);
    res.status(500).json({ error: err });
  }
});
