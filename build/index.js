import express, { urlencoded, json } from "express";
import { env } from "./env.js";
import { limiter } from "./middlewares/limiter.js";
import cors from "cors";
import bodyParser from "body-parser";
import "dotenv/config";
import dbJSON from "./db/db.js";
const allowedOrigins = ["http://localhost:3000"];
const corsOptions = {
    origin: allowedOrigins,
};
const app = express();
app.use(cors(corsOptions));
app.use(json({ limit: "500kb" }));
app.use(urlencoded({ limit: "500kb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "500kb", extended: false }));
app.use(limiter); // adding rate limiting middleware
const port = parseInt(env.PORT) || 5500;
if (!port)
    throw new Error("Port not found");
app.get("/status", async (_, res) => {
    res.send("OK");
});
app.get("/db", async (_, res) => {
    res.json(dbJSON());
});
app.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}.`);
});
//# sourceMappingURL=index.js.map