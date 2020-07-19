import express from 'express'
import dotenv from "dotenv";
import { userRouter } from './routes/UserRouter';
import { postRouter } from './routes/PostRouter';

dotenv.config();
const app = express();
app.use(express.json())

app.use('/users', userRouter) 
app.use('/posts', postRouter )

export default app
