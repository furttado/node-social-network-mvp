import express from "express";
import dotenv from "dotenv";
import { userRouter } from "./routes/UserRouter";
import { postRouter } from "./routes/PostRouter";
//const cors = require("cors");
import cors from "cors";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

app.use(express.json());
/*
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
  next();
});
*/
/*
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "*")
  app.use(cors());
  next();
});
*/

app.use("/users", userRouter);
app.use("/posts", postRouter);

export default app;
