import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { Server } from "http";

const port = config.port;

let server: Server;

async function main() {
  // console.log(config.mongo_Uri)
  try {
    const dbConnection = await mongoose.connect(config.mongo_Uri);
    if (dbConnection.connection.readyState !== 1) {
      throw new Error("Error connecting to database");
    }
    server = app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

// Global error handling
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection:", reason);
  if (server) server.close(() => process.exit(1));
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

main();
