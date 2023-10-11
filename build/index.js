import { randomUUID } from "crypto";
// import FileRead
import express, { json, urlencoded, } from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { MongoClient, ServerApiVersion } from "mongodb";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
const allowedOrigins = ["http://localhost:3000"];
const corsOptions = {
    origin: allowedOrigins,
};
const app = express();
app.use(cors(corsOptions));
app.use(json({ limit: "500kb" }));
app.use(urlencoded({ limit: "500kb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "500kb", extended: false }));
const port = process.env.PORT;
if (!process.env.PORT) {
    throw new Error("Port not found");
}
const uri = process.env.MONGODB_CONNECTION_STRING;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
const supaConfig = {
    projectURL: process.env.SupaProjectURL,
    anonkey: process.env.SupaAnonKey,
};
const supabase = createClient(supaConfig.projectURL, supaConfig.anonkey);
app.get("/status", async (_, res) => {
    res.send("OK");
});
const apiKeyMiddleware = (req, res, next) => {
    const { apikey } = req.headers; // Assuming the API key is provided in headers
    const serverApiKey = process.env.SERVER_CONNECTION_APIKEY; // Replace this with your actual server API key
    if (apikey === serverApiKey) {
        next(); // Move on to the next middleware or route handler
    }
    else {
        res.status(401).json({ error: "Unauthorized Access" });
    }
};
app.post("/upload", apiKeyMiddleware, async (req, res) => {
    const { filename, username, fileurl } = req.body;
    if (typeof fileurl !== "string") {
        res.status(400).json({ error: "Invalid type" });
    }
    else if (filename === "" || username === "" || fileurl === "") {
        res.status(400).json({ error: "Invalid request body" });
    }
    else {
        await sendUploadRequest(filename, username, fileurl, res)
            .then(async function (data) {
            console.log(data);
        })
            .catch(async function (error) {
            console.log(error);
        });
    }
});
const MongoUpload = {
    database: "primary",
    collection: "uploads",
};
async function sendUploadRequest(filename, username, fileurl, res) {
    try {
        await client.connect();
        const database = client.db(MongoUpload.database);
        const collection = database.collection(MongoUpload.collection);
        const filter = { filename: filename };
        const existingFile = await collection.findOne(filter);
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
        const data = {
            uploadID: randomUUID(),
            filename,
            username,
            fileurl,
            status: "uploaded",
            date: formattedDate,
        };
        if (existingFile) {
            const updateRes = await collection.updateOne(filter, { $set: { fileurl: fileurl } }, { upsert: false });
            if (updateRes.matchedCount === 0) {
                res.status(500).send({ error: "Failed to upload file" });
                return "Failed to upload file";
            }
            else {
                res.status(200).send({ message: "File uploaded successfully" });
                return "File uploaded successfully";
            }
        }
        else {
            const result = await collection.insertOne(data);
            if (!result) {
                res.status(500).send({ error: "Failed to upload file" });
                return "Failed to upload file";
            }
            else {
                res.status(200).send({ message: "File uploaded successfully" });
                return "File uploaded successfully";
            }
        }
    }
    catch (error) {
        console.log(error);
    }
    finally {
        await client.close();
    }
}
app.get("/files", apiKeyMiddleware, async (_, res) => {
    getFiles(res)
        .then(async function (data) {
        console.log(data);
    })
        .catch(async function (error) {
        console.log(error);
    });
});
async function getFiles(res) {
    try {
        await client.connect();
        const database = client.db(MongoUpload.database);
        const collection = database.collection(MongoUpload.collection);
        const query = {};
        const cursor = collection.find(query, {
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
        }
        else {
            res.json(result);
            return "returned file object";
        }
    }
    catch (error) {
        console.log(error);
        return "MongoDB server failed to perform R/W";
    }
    finally {
        await client.close();
    }
}
app.get("/download/:filename", apiKeyMiddleware, async (req, res) => {
    const { filename } = req.params;
    if (typeof filename !== "string") {
        res.status(400).json({ error: "Invalid type" });
    }
    else if (filename === "") {
        res.status(400).json({ error: "Invalid request" });
    }
    else {
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
});
const storageDriver = {
    Bucket: process.env.Bucket,
    BucketFolder: process.env.BucketFolder,
};
async function downloadFile(filename) {
    const { data } = await supabase.storage
        .from("shadow")
        .createSignedUrl(`private/${filename}`, 60, {
        download: true,
    });
    if (!data) {
        throw new Error("Failed to download file");
    }
    else {
        return data.signedUrl;
    }
}
app.delete("/delete/:filename", apiKeyMiddleware, async function (req, res) {
    const { filename } = req.params;
    if (typeof filename !== "string") {
        res.status(400).json({ error: "Invalid type" });
    }
    else if (filename === "") {
        res.status(400).json({ error: "Invalid request" });
    }
    else {
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
});
async function deleteFile(filename) {
    const { data, error } = await supabase.storage
        .from(storageDriver.Bucket)
        .remove([`${storageDriver.BucketFolder}/${filename}`]);
    if (!error) {
        console.log(data);
        return "File deleted successfully";
    }
    else {
        throw new Error("Failed to delete file");
    }
}
app.listen(port, () => {
    console.log(`🟢 [server] Application is online and listening on port ${port}.`);
});
//# sourceMappingURL=index.js.map