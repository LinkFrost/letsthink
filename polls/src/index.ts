import initRabbit from "./utils/initRabbit.js";
import initPostgres from "./utils/initPostgres.js";
import initExpress from "./utils/initExpress.js";
import z from "zod";
import type { HTTPRequest, PollCreated } from "./types/events.js";
import { Channel } from "amqplib";

const publishHTTPEvent = (eventBus: Channel, code: number) => {
  const event: HTTPRequest = { key: "HTTPRequest", data: { status: code } };
  eventBus.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));
};

const queue = "polls";

const { eventBusChannel } = await initRabbit(queue, ["RoomCreated", "RoomExpired"]);
const pgClient = await initPostgres("polls-db");
const app = initExpress(4003);

// Listen for incoming messages
eventBusChannel.consume(queue, async (message) => {
  if (message !== null) {
    const { key, data } = JSON.parse(message.content.toString());

    console.log(`Received event of type ${key}`);

    try {
      let query: string;
      let queryValues: string[];

      switch (key) {
        case "RoomCreated": {
          const { id, room_type } = data;

          if (room_type === "poll") {
            query = "INSERT INTO rooms(id) VALUES($1) RETURNING *";
            queryValues = [id];
            pgClient.query(query, queryValues);
          }

          break;
        }

        case "RoomExpired": {
          const { id } = data;

          query = "DELETE FROM rooms WHERE id=$1";
          queryValues = [id];
          pgClient.query(query, queryValues);

          break;
        }
      }
    } catch (err) {
      eventBusChannel.nack(message);
    }
    eventBusChannel.ack(message);
  }
});

app.post("/polls", async (req, res) => {
  const reqBody = z.object({
    room_id: z.string(),
    poll_options: z
      .array(
        z.object({
          title: z.string().min(1).max(60),
          position: z.number().int(),
        })
      )
      .min(2)
      .max(10),
  });

  try {
    // Validate body
    reqBody.parse(req.body);

    const { room_id, poll_options } = req.body;

    // Check if given room_id matches a valid room and if that room is expired
    const roomQueryResults = await pgClient.query("SELECT * FROM rooms WHERE id=$1", [room_id]).then((res) => res.rows);

    if (roomQueryResults.length !== 1) {
      return res.status(400).send({ error: `Room with id ${room_id} does not exist or is expired!` });
    }

    let createdOptions = [];

    for (const poll_option of poll_options) {
      const optionQueryText = "INSERT INTO poll_options(title, position, room_id) VALUES($1, $2, $3) RETURNING *";
      const optionQueryValues = [poll_option.title, poll_option.position, room_id];

      const createdOption = await pgClient.query(optionQueryText, optionQueryValues).then((res) => res.rows[0]);
      createdOptions.push(createdOption);
    }

    const event: PollCreated = { key: "PollCreated", data: { room_id: room_id, poll_options: createdOptions } };
    eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

    publishHTTPEvent(eventBusChannel, 200);
    res.status(200).send({ success: "Created poll" });
  } catch (err) {
    publishHTTPEvent(eventBusChannel, 500);
    res.status(500).send({ error: err });
  }
});
