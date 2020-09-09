import { Request, Response } from "express";
import { UserBusiness } from "../business/UserBusiness";
import { Authenticator } from "../services/Authenticator";
import { MainDatabase } from "../data/MainDatabase";
import { UserDatabase } from "../data/UserDatabase";
import { IdGenerator } from "../services/IdGenerator";
import { HashManager } from "../services/HashManager";
import { InputChecker } from "../services/InputChecker";
import { toUserRole } from "../models/UserModel";

export class UserController {
  private static userBusiness = new UserBusiness(
    new UserDatabase(),
    new IdGenerator(),
    new HashManager(),
    new InputChecker(),
    new Authenticator()
  );

  async register(req: Request, res: Response) {
    try {
      const receivedData = {
        email: req.body.email,
        password: req.body.password,
        nickname: req.body.nickname,
        name: req.body.name,
        picture: req.body.picture,
        bio: req.body.bio,
        role: req.body.role || undefined,
      };

      const createUserAndGetAccessToken = await UserController.userBusiness.register(
        receivedData.email,
        receivedData.password,
        receivedData.nickname,
        receivedData.name,
        receivedData.picture,
        receivedData.bio,
        toUserRole(receivedData.role) || undefined
      );

      res.status(201).send(createUserAndGetAccessToken);
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const receivedData = {
        email: req.body.email,
        password: req.body.password,
      };

      const data = await UserController.userBusiness.login(
        receivedData.email,
        receivedData.password
      );

      res.status(200).send({ accessToken: data.accessToken, user: data.userData });
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
    await MainDatabase.destroyConnection();
  }

  async approve(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const nickname = req.body.nickname;

      await UserController.userBusiness.approve(token, nickname);

      res.status(201).send({ message: "User approved!" });
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
    await MainDatabase.destroyConnection();
  }

  async getUserbyId(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const token = req.headers.token as string;

      const user = await UserController.userBusiness.getUserById(token, id);

      res.status(200).send(user);
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
    await MainDatabase.destroyConnection();
  }

  async getAnyProfile(req: Request, res: Response) {
    try {
      const nickname = req.params.nickname;
      const token = req.headers.token as string;

      const user = await UserController.userBusiness.getAnyProfile(token, nickname);

      res.status(200).send(user);
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
  }

  async getOwnProfile(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const profile = await UserController.userBusiness.getOwnProfile(token);

      res.status(200).send({ profile });
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
  }

  async followUser(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const nickname = req.body.nickname;

      await UserController.userBusiness.followUser(token, nickname);

      res.status(200).send({ message: "Request to follow sent" });
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
  }

  async unfollowUser(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const nickname = req.params.nickname;

      await UserController.userBusiness.unfollowUser(token, nickname);

      res.status(200).send({ message: "Success" });
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
  }

  async editProfile(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const name = req.body.name || undefined;
      const picture = req.body.picture || undefined;
      const bio = req.body.bio || undefined;

      await UserController.userBusiness.editProfile(
        token,
        name || undefined,
        picture || undefined,
        bio || undefined
      );

      res.status(200).send({ message: "Success" });
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
  }

  async editNickname(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const nickname = req.body.nickname;

      const result = await UserController.userBusiness.editNickname(token, nickname);

      res.status(200).send(result);
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
  }
  async getFollowRequests(req: Request, res: Response) {
    try {
      const token = req.headers.token as string;
      const result = await UserController.userBusiness.getFollowRequests(token);

      res.status(200).send(result);
    } catch (err) {
      res.status(err.errorCode || 400).send({ message: err.message });
    }
  }
}
