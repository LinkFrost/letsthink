import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export default (port: number) => {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: process.env.ORIGIN,
      credentials: true,
      allowedHeaders: ["Authorization", "Content-Type", "Access-Control-Allow-Credentials", "Access-Control-Allow-Origin"],
      exposedHeaders: ["Authorization"],
    })
  );

  app.listen(port, () => {
    console.log(`Auth service listening on port ${port}`);
  });

  return app;
};
