import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

export default (port: number) => {
  const app = express();
  app.use(express.json());
  app.use(cors());

  app.listen(port, () => {
    console.log(`Site-Health service listening on port ${port}`);
  });

  return app;
};
