import express from "express";
import pg from "pg";
import cors from "cors";
import cookieParser from "cookie-parser";
import z from "zod";
import redis from "redis";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { UserData } from "./events.js";

const SECRET = "sYxxNMQuG7UJHGLXPrMQ4vliNdTapB2zdHP39jqMpjI";
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
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type", "Access-Control-Allow-Credentials", "Access-Control-Allow-Origin"],
    exposedHeaders: ["Authorization"],
  })
);
app.use(cookieParser());

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
      res.send({ error: err });
    }

    const userDataResults = await pgClient.query("SELECT * FROM users where id=$1", [tokenUserData.id]).then((res) => res.rows);

    if (userDataResults.length !== 1) {
      res.status(200).send({ error: `User with id ${tokenUserData.id} does not exist!` });
    }

    const newTokenData = {
      id: userDataResults[0].id,
      email: userDataResults[0].email,
      username: userDataResults[0].username,
    };

    const accessToken = jwt.sign(newTokenData, SECRET, { expiresIn: "15s" });
    const newRefreshToken = jwt.sign(newTokenData, REFRESH_SECRET);

    return res
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: true,
        path: "/auth",
      })
      .set("Authorization", "Bearer " + accessToken)
      .set("Access-Control-Allow-Origin", "http://localhost:3000")
      .status(200)
      .send({ success: "Generated new access token" });
  });
});

app.post("/auth/login", async (req, res) => {
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

    const tokenUserData = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
    };

    const accessToken = jwt.sign(tokenUserData, SECRET, { expiresIn: "15s" });
    const refreshToken = jwt.sign(tokenUserData, REFRESH_SECRET);

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
        path: "/auth",
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

app.listen(4007, () => {
  console.log("Listening on port 4007");
});
