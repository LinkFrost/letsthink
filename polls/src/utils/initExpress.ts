import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

const auth = () => {
  return function verifyToken(req: any, res: any, next: any) {
    const header = req.headers["authorization"];
    const token = header && header.split(" ")[1];

    if (token == null) {
      return res.status(400).send({ error: "Invalid auth token!" });
    }

    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error("missing JWT_ACCESS_SECRET environment variable");
    }

    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(400).send({ jwtError: err });
      }

      next();
    });
  };
};

export default (port: number) => {
  const app = express();

  console.log(process.env.ORIGIN);

  app.use(express.json());
  app.use(
    cors({
      origin: process.env.ORIGIN as string,
      credentials: true,
      allowedHeaders: ["Authorization", "Content-Type", "Access-Control-Allow-Credentials"],
      exposedHeaders: ["Authorization"],
    })
  );
  app.use(auth());

  app.listen(port, () => {
    console.log(`Polls service listening on port ${port}`);
  });

  return app;
};
