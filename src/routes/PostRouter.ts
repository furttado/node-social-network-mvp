import express from "express";
import { PostController } from "../controller/PostController";

export const postRouter = express.Router();

postRouter.post("/create", new PostController().createPost);
postRouter.delete("/delete", new PostController().deletePost);
postRouter.get("/user/:nickname", new PostController().getPostsFromFriend);
postRouter.get("/all/:page", new PostController().getAllPosts);
postRouter.get("/feed", new PostController().getFeed);
postRouter.post("/editPost", new PostController().editPost);
