import express from "express";
import dotenv from "dotenv";
import { userRouter } from "./routes/UserRouter";
import { postRouter } from "./routes/PostRouter";
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

app.use("/users", userRouter);
app.use("/posts", postRouter);

export default app;
