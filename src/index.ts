import express, { Express, urlencoded, json } from "express";
import cors from "cors";
import { Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import dbJSON from "./db/db.js";

dotenv.config();

const allowedOrigins = ["http://localhost:3000"];
const corsOptions = {
  origin: allowedOrigins,
};

const app: Express = express();

app.use(cors(corsOptions));
app.use(json({ limit: "500kb" }));
app.use(urlencoded({ limit: "500kb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "500kb", extended: false }));
const port = process.env.PORT;

if (!port) throw new Error("Port not found");

app.get("/status", async (_, res: Response) => {
  res.send("OK");
});

app.get("/json", async (_, res: Response) => {
  //added type for Response from express
  res.json(dbJSON());
});

app.listen(port, () => {
  console.log(`🟢 [server] Online and listening on port ${port}.`);
});
