import express from "express";
import { UserController } from "../controller/UserController";

export const userRouter = express.Router();
userRouter.post("/register", new UserController().register);
userRouter.post("/login", new UserController().login);
userRouter.post("/approve", new UserController().approve);
userRouter.get("/follow-requests", new UserController().getFollowRequests);
userRouter.get("/profiles/user", new UserController().getOwnProfile);
userRouter.post("/follow", new UserController().followUser);
userRouter.post("/editprofile", new UserController().editProfile);
userRouter.post("/editnickname", new UserController().editNickname);
userRouter.delete("/unfollow/:nickname", new UserController().unfollowUser);
userRouter.delete("/reject/:nickname", new UserController().rejectFollower);
userRouter.get("/profiles/:nickname", new UserController().getAnyProfile);
//userRouter.get("/:id", new UserController().getUserbyId);
