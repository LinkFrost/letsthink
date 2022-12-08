import initExpress from "./init/initExpress.js";
import { EventKeys } from "./util/events.js";
import initEventBus from "./init/initRabbit.js";
import { string, z } from "zod";
import * as argon2 from "argon2";
import initPostgres from "./init/initPostgres.js";

// CONSTANTS
const REQS_PW = { min: 1, max: 16 };
const REQS_USERNAME = { min: 1, max: 16 };

// Event Types that email service is interested in
type UserFields = {
  email: string;
  username: string;
  password: string;
};

const q = "users";
const subscriptions: EventKeys[] = [];

// Initialize outside communications
const { eventBusChannel, confirmChannel } = await initEventBus(q, subscriptions);
const { server } = await initExpress();
const { postgres } = await initPostgres("users-db");

// Helper Functions
const storeUser = async ({ username, email, password }: UserFields) => {
  const query = "INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING username, email";
  const queryValues = [username, email, password];
  const result = await postgres.query(query, queryValues);

  if (!result || !result.rows.length) {
    throw new Error("Could not store user");
  }

  return result.rows[0];
};

// REST Server
server.post("/users", async (req, res) => {
  try {
    z.object({
      email: z.string().email(),
      password: z.string().min(REQS_PW.min).max(REQS_USERNAME.max),
      username: z.string().min(REQS_USERNAME.min).max(REQS_USERNAME.max),
    }).parse(req.body);

    const { email, password, username } = req.body;

    const passwordHash = await argon2.hash(password);

    const user = await storeUser({ email, password: passwordHash, username });

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

server.get("/users", async (req, res) => {
  const result = await postgres.query("SELECT * FROM users");

  res.send(result.rows ?? "No users");
});

server.listen(4006, () => {
  console.log("Users service listening on port 4006");
});
