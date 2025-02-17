import express from "express";
import cors from "cors";
import Routes from "./routes";
import globalErrorHandler from "./middleWare/globalErrorhandeler";
import routeNotFound from "./middleWare/routNotFound";

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome to Bag Shop Server API!");
});

// Routes
app.use("/api/v1", Routes);

app.use(globalErrorHandler);
app.use(routeNotFound);

export default app;
