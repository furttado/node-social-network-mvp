import { Request, Response } from "express";
import { PostBusiness } from "../business/PostBusiness";
import { Authenticator } from "../services/Authenticator";
import { MainDatabase } from "../data/MainDatabase";
import { PostDatabase } from "../data/PostDatabase";
import { IdGenerator } from "../services/IdGenerator";
import { toPostRole } from "../models/PostModel";

export class PostController {
  private static postBusiness = new PostBusiness(
    new PostDatabase(),
    new IdGenerator(),
    new Authenticator()
  );

  async createPost(req: Request, res: Response) {
    try {
      const receivedData = {
        token: req.headers.token as string,
        title: req.body.title,
        picture: req.body.picture,
        description: req.body.description,
        role: req.body.role,
      };

      await PostController.postBusiness.createPost(
        receivedData.token,
        receivedData.title,
        receivedData.picture,
        receivedData.description,
        toPostRole(receivedData.role)
      );

      res.status(201).send({ message: "Post created successfully" });
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
  }

  async deletePost(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const postId = req.body.postId;
      await PostController.postBusiness.deletePost(postId, token);

      res.status(200).send({ message: "Post deleted successfully" });
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
  }

  async getPostsFromFriend(req: Request, res: Response) {
    try {
      const nickname = req.params.nickname;
      const token = req.headers.token as string;
      const post = await PostController.postBusiness.getPostsByNickname(nickname, token);
      res.status(200).send(post);
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
  }

  async getAllPosts(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const page = Number(req.params.page);
      const posts = await PostController.postBusiness.getPostsAndNickname(page, token);

      res.status(200).send(posts);
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
  }

  async getFeed(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const feed = await PostController.postBusiness.getFeed(token);

      res.status(200).send(feed);
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
  }

  async editPost(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const postId = req.body.postId;
      const title = req.body.title || undefined;
      const picture = req.body.picture || undefined;
      const description = req.body.description || undefined;

      await PostController.postBusiness.editPost(
        token,
        postId,
        title || undefined,
        picture || undefined,
        description || undefined
      );

      res.status(200).send({ message: "Success" });
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
  }
}
