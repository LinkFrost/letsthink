import express from "express";
import pg from "pg";
import cors from "cors";
import cookieParser from "cookie-parser";
import z from "zod";
import redis from "redis";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { UserData } from "./events.js";

const SECRET = "60d4a0d941aa2dadadb3b813a695fbc1";
const REFRESH_SECRET = "397d1fe1c55e51879eb75713d18d9133";

// Connect to service specific database
const pgClient = new pg.Pool({
  user: "postgres",
  password: "postgres",
  host: "users-db",
  port: 5432,
});

const redisClient = redis.createClient({ url: "redis://authenticator-cache" });

await pgClient.connect();
await redisClient.connect();

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log(refreshToken);

  if (!(await redisClient.get(refreshToken))) {
    return res.status(400).send({ error: "Refresh token doesn't exist" });
  }

  jwt.verify(refreshToken, REFRESH_SECRET, (err: any, user: any) => {
    if (err) {
      res.send({ error: err });
    }

    const userData = {
      id: user.id,
      email: user.email,
      password: user.password,
      username: user.username,
    };

    const accessToken = jwt.sign(userData, SECRET, { expiresIn: "15s" });

    return res
      .set("Authorization", "Bearer " + accessToken)
      .status(200)
      .send("Generated new access token");
  });
});

app.post("/login", async (req, res) => {
  const reqBody = z.object({
    email: z.string(),
    password: z.string(),
  });

  try {
    // Validate body
    reqBody.parse(req.body);

    const { email, password } = req.body;

    const userQuery = await pgClient.query("SELECT * FROM users WHERE email=$1", [email]).then((res) => res.rows);

    if (userQuery.length !== 1) {
      return res.status(400).send({ error: `User with email ${email} does not exist!` });
    }

    const userData: UserData = userQuery[0];

    if (!(await argon2.verify(userData.password, password))) {
      return res.status(400).send({ error: "Incorrect password!" });
    }

    const accessToken = jwt.sign(userData, SECRET, { expiresIn: "15s" });
    const refreshToken = jwt.sign(userData, REFRESH_SECRET);

    await redisClient.set(refreshToken, userData.id);

    res
      .set("Authorization", "Bearer " + accessToken)
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
      })
      .send("Successfully authorized");
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

app.delete("/signout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken || !(await redisClient.get(refreshToken))) {
    return res.status(400).send("Refresh token does not exist!");
  }

  await redisClient.del(refreshToken);

  req.cookies.destroy;

  return res.clearCookie("refreshToken").status(200).send("Successfully signed out");
});

app.listen(4007, () => {
  console.log("Listening on port 4007");
});
