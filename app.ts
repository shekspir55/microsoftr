import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";

import {
  bombardWithCronRecord,
  deleteCronRecord,
  getCronRecords,
  postCronRecord,
  putCronRecord,
} from "./controllers/cron-record.controller";
import { getLogs } from "./controllers/log.controller";

const app: Application = express();

app.use(bodyParser.json());
if (process.env.NODE_ENV !== "production") {
  app.use(cors());
}

// test route
app.get("/", (req, res) => res.json({ message: "Hello world" }));

// logs
app.get("/api/logs", getLogs);

// cron-records
app.get("/api/cron-records", getCronRecords);
app.post("/api/cron-records", postCronRecord);
app.put("/api/cron-records/:recordId", putCronRecord);
app.delete("/api/cron-records/:recordId", deleteCronRecord);

app.post("/api/cron-records/bombard", bombardWithCronRecord);

export default app;
