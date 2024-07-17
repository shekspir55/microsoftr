import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import {
  getArrayDataFromSheet,
  getObjectFromSheet,
} from "./helpers/spreadsheet.helper";

const app: Application = express();

app.use(bodyParser.json());
if (process.env.NODE_ENV !== "production") {
  app.use(cors());
}

// test route
app.get("/", (req, res) => res.json({ message: "Hello world" }));

app.get("/api/array-data-from-sheet", async (req, res) => {
  const { spreadsheetUrl, sheet, format } = req.query;
  try {
    const result = await getArrayDataFromSheet(
      spreadsheetUrl as string,
      sheet as string,
      JSON.parse(format as string)
    );
    res.status(200).send(result);
  } catch (error: Error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

app.get("/api/object-from-sheet", async (req, res) => {
  const { spreadsheetUrl, sheet, format } = req.query;

  try {
    const result = await getObjectFromSheet(
      spreadsheetUrl as string,
      sheet as string,
      JSON.parse(format as string)
    );
    res.status(200).send(result);
  } catch (error: Error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default app;
