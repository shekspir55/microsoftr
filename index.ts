import dotenv from "dotenv";
import app from "./app";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
