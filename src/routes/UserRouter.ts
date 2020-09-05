import express from "express";
import { UserController } from "../controller/UserController";

export const userRouter = express.Router();
userRouter.post("/register", new UserController().register);
userRouter.post("/login", new UserController().login);
userRouter.post("/approve", new UserController().approve);
userRouter.get("/:id", new UserController().getUserbyId);
userRouter.get("/profiles/user", new UserController().getOwnProfile);
userRouter.get("/profiles/:nickname", new UserController().getAnyProfile);
userRouter.post("/follow", new UserController().followUser);
userRouter.delete("/unfollow/:nickname", new UserController().unfollowUser);
userRouter.post("/editprofile", new UserController().editProfile);
userRouter.post("/editnickname", new UserController().editNickname);
