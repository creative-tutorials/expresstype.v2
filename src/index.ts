import { randomUUID } from "crypto";
// import FileRead
import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction,
} from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { MongoClient, ServerApiVersion } from "mongodb";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { ParamsDictionary } from "express-serve-static-core";

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

if (!process.env.PORT) {
  throw new Error("Port not found");
}

const uri = process.env.MONGODB_CONNECTION_STRING as string;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

type supaType = {
  projectURL: string;
  anonkey: string;
};

const supaConfig: supaType = {
  projectURL: process.env.SupaProjectURL as string,
  anonkey: process.env.SupaAnonKey as string,
};

const supabase = createClient(supaConfig.projectURL, supaConfig.anonkey);

app.get("/status", async (_, res) => {
  res.send("OK");
});

const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { apikey } = req.headers; // Assuming the API key is provided in headers
  const serverApiKey = process.env.SERVER_CONNECTION_APIKEY; // Replace this with your actual server API key

  if (apikey === serverApiKey) {
    next(); // Move on to the next middleware or route handler
  } else {
    res.status(401).json({ error: "Unauthorized Access" });
  }
};

type CustomParams = ParamsDictionary & {
  filename: string;
};

type uploadBodyReq = {
  filename: string;
  username: string;
  fileurl: string;
};

app.post("/upload", apiKeyMiddleware, async (req: Request, res: Response) => {
  const { filename, username, fileurl }: uploadBodyReq = req.body;

  if (typeof fileurl !== "string") {
    res.status(400).json({ error: "Invalid type" });
  } else if (filename === "" || username === "" || fileurl === "") {
    res.status(400).json({ error: "Invalid request body" });
  } else {
    await sendUploadRequest(filename, username, fileurl, res)
      .then(async function (data) {
        console.log(data);
      })
      .catch(async function (error) {
        console.log(error);
      });
  }
});

type dataObj = uploadBodyReq & {
  uploadID: string;
  status: string;
  date: string;
};

type upload = {
  database: string;
  collection: string;
};

const MongoUpload: upload = {
  database: "primary",
  collection: "uploads",
};

type uploadSelect = Pick<dataObj, "filename">;

async function sendUploadRequest(
  filename: string,
  username: string,
  fileurl: string,
  res: Response
) {
  try {
    await client.connect();
    const database = client.db(MongoUpload.database);
    const collection = database.collection<dataObj>(MongoUpload.collection);

    const filter = { filename: filename };

    const existingFile = await collection.findOne<uploadSelect>(filter);

    const currentDate = new Date().getDate();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentMonth = months[new Date().getMonth()];
    const currentYear = new Date().getFullYear();
    const formattedDate = `${currentMonth} ${currentDate} ${currentYear}`;

    const data: dataObj = {
      uploadID: randomUUID(),
      filename,
      username,
      fileurl,
      status: "uploaded",
      date: formattedDate,
    };

    if (existingFile) {
      const updateRes = await collection.updateOne(
        filter,
        { $set: { fileurl: fileurl } },
        { upsert: false }
      );

      if (updateRes.matchedCount === 0) {
        res.status(500).send({ error: "Failed to upload file" });
        return "Failed to upload file";
      } else {
        res.status(200).send({ message: "File uploaded successfully" });
        return "File uploaded successfully";
      }
    } else {
      const result = await collection.insertOne(data);

      if (!result) {
        res.status(500).send({ error: "Failed to upload file" });
        return "Failed to upload file";
      } else {
        res.status(200).send({ message: "File uploaded successfully" });
        return "File uploaded successfully";
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
}

app.get("/files", apiKeyMiddleware, async (_, res: Response) => {
  getFiles(res)
    .then(async function (data) {
      console.log(data);
    })
    .catch(async function (error) {
      console.log(error);
    });
});

async function getFiles(res: Response) {
  try {
    await client.connect();
    const database = client.db(MongoUpload.database);
    const collection = database.collection<dataObj>(MongoUpload.collection);

    const query = {};

    const cursor = collection.find<dataObj>(query, {
      projection: {
        _id: 0,
        uploadID: 1,
        filename: 1,
        fileurl: 1,
        username: 1,
        status: 1,
        date: 1,
      },
    });

    const result = await cursor.toArray(); // Returns an array of documents

    if (result.length === 0 || !result) {
      res.status(404).send({ error: "No file found!" });
      return "No file found!";
    } else {
      res.json(result);
      return "returned file object";
    }
  } catch (error) {
    console.log(error);
    return "MongoDB server failed to perform R/W";
  } finally {
    await client.close();
  }
}

app.get(
  "/download/:filename",
  apiKeyMiddleware,
  async (req: Request, res: Response) => {
    const { filename } = req.params as CustomParams;

    if (typeof filename !== "string") {
      res.status(400).json({ error: "Invalid type" });
    } else if (filename === "") {
      res.status(400).json({ error: "Invalid request" });
    } else {
      await downloadFile(filename)
        .then(async function (data) {
          console.log(data);
          res.send({ message: data });
        })
        .catch(async function (error) {
          console.log(error);
          res.status(500).send({ error: "Failed to download file" });
        });
    }
  }
);

type storageEnv = {
  Bucket: string;
  BucketFolder: string;
};

const storageDriver: storageEnv = {
  Bucket: process.env.Bucket as string,
  BucketFolder: process.env.BucketFolder as string,
};

async function downloadFile(filename: string) {
  const { data } = await supabase.storage
    .from("shadow")
    .createSignedUrl(`private/${filename}`, 60, {
      download: true,
    });
  if (!data) {
    throw new Error("Failed to download file");
  } else {
    return data.signedUrl;
  }
}

app.delete(
  "/delete/:filename",
  apiKeyMiddleware,
  async function (req: Request, res: Response) {
    const { filename } = req.params as CustomParams;

    if (typeof filename !== "string") {
      res.status(400).json({ error: "Invalid type" });
    } else if (filename === "") {
      res.status(400).json({ error: "Invalid request" });
    } else {
      await deleteFile(filename)
        .then(async function (data) {
          console.log(data);
          res.send({ message: data });
        })
        .catch(async function (error) {
          console.log(error);
          res.status(500).send({ error: "Failed to delete file" });
        });
    }
  }
);

async function deleteFile(filename: string) {
  const { data, error } = await supabase.storage
    .from(storageDriver.Bucket)
    .remove([`${storageDriver.BucketFolder}/${filename}`]);

  if (!error) {
    console.log(data);
    return "File deleted successfully";
  } else {
    throw new Error("Failed to delete file");
  }
}

app.listen(port, () => {
  console.log(
    `🟢 [server] Application is online and listening on port ${port}.`
  );
});
