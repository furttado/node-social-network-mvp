import express from "express";
import dotenv from "dotenv";
import { userRouter } from "./routes/UserRouter";
import { postRouter } from "./routes/PostRouter";
var cors = require("cors");

dotenv.config();
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  app.use(cors());
  next();
});

app.use("/users", userRouter);
app.use("/posts", postRouter);

export default app;
