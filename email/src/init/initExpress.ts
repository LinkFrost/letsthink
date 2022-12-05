import express from "express";
import cors from "cors";

export default async () => {
  const app = express();

  // Add middleware here
  app.use(express.json());
  app.use(cors());

  return { server: app };
};
