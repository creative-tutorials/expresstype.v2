import express, { type Express, urlencoded, json } from "express";
import { env } from "./env";
import cors from "cors";
import { type Response } from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import dbJSON from "./db/db";

const allowedOrigins = ["http://localhost:3000"];
const corsOptions = {
  origin: allowedOrigins,
};

const app: Express = express();

app.use(cors(corsOptions));
app.use(json({ limit: "500kb" }));
app.use(urlencoded({ limit: "500kb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "500kb", extended: false }));
const port = env.PORT;

if (!port) throw new Error("Port not found");

app.get("/status", async (_, res: Response) => {
  res.send("OK");
});

app.get("/db", async (_, res: Response) => {
  res.json(dbJSON());
});

app.listen(port, () => {
  console.log(`Listening on port http://localhost:${port}.`);
});
