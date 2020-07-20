import express from 'express'
import { UserController } from '../controller/UserController'

export const userRouter = express.Router();
userRouter.post('/register', new UserController().register);
userRouter.post('/login', new UserController().login);
userRouter.post('/approve', new UserController().approve);
userRouter.get('/:id', new UserController().getUserbyId);
userRouter.post('/follow', new UserController().followUser)
userRouter.delete('/unfollow', new UserController().unfollowUser)
userRouter.post('/edit', new UserController().editProfile)
