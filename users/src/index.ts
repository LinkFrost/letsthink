import initExpress from "./utils/initExpress.js";
import initPostgres from "./utils/initPostgres.js";
import initEventBus from "./utils/initRabbit.js";
import { EventKeys, UserCreated } from "./types/events.js";
import { z } from "zod";
import * as argon2 from "argon2";

// CONSTANTS
const REQS_PW = { min: 1, max: 16 };
const REQS_USERNAME = { min: 1, max: 16 };

// Event Types that email service is interested in
type UserFields = {
  email: string;
  username: string;
  password: string;
};

const queue = "users";
const subscriptions: EventKeys[] = [];

// Initialize outside communications
const { eventBusChannel } = await initEventBus(queue, subscriptions);
const app = initExpress(4006);
const { pgClient } = await initPostgres("users-db");

// Helper Functions
const storeUser = async ({ username, email, password }: UserFields) => {
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
    z.object({
      email: z.string().email(),
      password: z.string().min(REQS_PW.min).max(REQS_USERNAME.max),
      username: z.string().min(REQS_USERNAME.min).max(REQS_USERNAME.max),
    }).parse(req.body);

    const { email, password, username } = req.body;

    const passwordHash = await argon2.hash(password);

    const user = await storeUser({ email, password: passwordHash, username });

    const event: UserCreated = { key: "UserCreated", data: user };

    eventBusChannel.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));

    res.send(user);
  } catch (error) {
    if (error instanceof Error) {
      if ((error as Error & { code: string | undefined }).code === "23505") {
        res.status(403).send("A user with that username or email already exists");
      }
    } else {
      res.status(400).send("Bad Request");
    }
  }
});

app.get("/users", async (req, res) => {
  const result = await pgClient.query("SELECT * FROM users");

  res.send(result.rows ?? "No users");
});
