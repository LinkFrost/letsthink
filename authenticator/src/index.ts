import * as dotenv from "dotenv";
dotenv.config();
import initExpress from "./utils/initExpress.js";
import initPostgres from "./utils/initPostgres.js";
import z from "zod";
import redis from "redis";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { HTTPRequest, UserData } from "./types/events.js";
import { Channel } from "amqplib";

const SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

const publishHTTPEvent = (eventBus: Channel, code: number) => {
  const event: HTTPRequest = { key: "HTTPRequest", data: { status: code } };
  eventBus.publish("event-bus", event.key, Buffer.from(JSON.stringify(event)));
};

if (!SECRET || !REFRESH_SECRET) {
  throw new Error("One or more JWT environment variables missing!");
}

const app = initExpress(4007);
const { pgClient } = await initPostgres("users-db");

const redisClient = redis.createClient({ url: "redis://authenticator-cache" });
await redisClient.connect();

app.get("/auth/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(200).send({ error: "Refresh token not attached as cookie!" });
  }

  const tokenUserData = JSON.parse(Buffer.from(refreshToken.split(".")[1], "base64").toString());

  if (!(await redisClient.get(tokenUserData.id))) {
    return res.status(200).send({ error: "Refresh token does not exist in cache" });
  }

  jwt.verify(refreshToken, REFRESH_SECRET, async (err: any, user: any) => {
    if (err) {
      return res.send({ error: err });
    }

    const userDataResults = await pgClient.query("SELECT * FROM users where id=$1", [tokenUserData.id]).then((res) => res.rows);

    if (userDataResults.length !== 1) {
      return res.status(200).send({ error: `User with id ${tokenUserData.id} does not exist!` });
    }

    const newTokenData = {
      id: userDataResults[0].id,
      email: userDataResults[0].email,
      username: userDataResults[0].username,
    };

    const accessToken = jwt.sign(newTokenData, SECRET, { expiresIn: "30d" });
    const newRefreshToken = jwt.sign(newTokenData, REFRESH_SECRET, { expiresIn: "60d" });

    await redisClient.set(tokenUserData.id, newRefreshToken);

    return res
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: true,
        path: "/",
      })
      .set("Authorization", "Bearer " + accessToken)
      .set("Access-Control-Allow-Origin", process.env.ORIGIN)
      .status(200)
      .send({ success: "Generated new access token" });
  });
});

app.post("/auth/login", async (req, res) => {
  const reqBody = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
  });

  try {
    // Validate body
    reqBody.parse(req.body);

    const { email, password } = req.body;

    const userQuery = await pgClient.query("SELECT * FROM users WHERE email=$1", [email]).then((res) => res.rows);

    if (userQuery.length !== 1) {
      return res.status(400).send({ loginError: `User with email ${email} does not exist!` });
    }

    const userData: UserData = userQuery[0];

    if (!(await argon2.verify(userData.password, password))) {
      return res.status(400).send({ loginError: "Incorrect password!" });
    }

    const tokenUserData = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
    };

    const accessToken = jwt.sign(tokenUserData, SECRET, { expiresIn: "30d" });
    const refreshToken = jwt.sign(tokenUserData, REFRESH_SECRET, { expiresIn: "60d" });

    await redisClient.set(userData.id, refreshToken);

    return res
      .header("Access-Control-Expose-Headers", "Authorization")
      .header("Access-Control-Allow-Headers", "Authorization,Content-Type,Content-Length")
      .header("Authorization", "Bearer " + accessToken)
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: true,
        path: "/",
      })
      .send({ success: "Successfully authorized" });
  } catch (err) {
    return res.status(500).send({ error: err });
  }
});

app.delete("/auth/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).send({ success: "Refresh token not attached as cookie!" });
  }

  const tokenUserData = JSON.parse(Buffer.from(refreshToken.split(".")[1], "base64").toString());

  if (!(await redisClient.get(tokenUserData.id))) {
    return res.status(400).send({ error: "Refresh token does not exist in cache" });
  }

  await redisClient.del(tokenUserData.id);

  return res.clearCookie("refreshToken", { path: "/auth" }).status(200).send({ success: "Successfully signed out" });
});
