import initExpress from "./utils/initExpress.js";
import initPostgres from "./utils/initPostgres.js";
import initEventBus from "./utils/initRabbit.js";
import { EventKeys, UserCreated } from "./types/events.js";
import { z } from "zod";
import * as argon2 from "argon2";

// CONSTANTS
const REQS_PW = { min: 8, max: 128 };
const REQS_USERNAME = { min: 3, max: 24 };

// incoming user fields
type UserFields = {
  email: string;
  username: string;
  password: string;
};

// config
const queue = "users";
const subscriptions: EventKeys[] = [];

// Initialize outside communications
const { eventBusChannel } = await initEventBus(queue, subscriptions);
const { pgClient } = await initPostgres("users-db");
const app = initExpress(4006);

// Helper Functions
const persistUser = async ({ username, email, password }: UserFields) => {
  const query = "INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING id, username, email";
  const queryValues = [username, email, password];
  const result = await pgClient.query(query, queryValues);

  if (!result || !result.rows.length) {
    throw new Error("Could not store user");
  }

  return result.rows[0] as UserCreated["data"];
};

// REST Server
app.post("/users", async (req, res) => {
  try {
    // validate incoming data
    z.object({
      email: z.string().email(),
      password: z.string().min(REQS_PW.min).max(REQS_USERNAME.max),
      username: z.string().min(REQS_USERNAME.min).max(REQS_USERNAME.max),
    }).parse(req.body);

    // grab user data and hash password
    const { email, password, username } = req.body;

    const passwordHash = await argon2.hash(password);

    // persist user in postgres
    const user = await persistUser({ email, password: passwordHash, username });

    // emit UserCreated event
    const event: UserCreated = { key: "UserCreated", data: user };

    eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

    res.send(user);
  } catch (error) {
    if (error instanceof Error) {
      if ((error as Error & { code: string | undefined }).code === "23505") {
        res.status(403).send("A user with that username or email already exists");
      } else {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
      }
    } else {
      res.status(400).send("Bad Request");
    }
  }
});
