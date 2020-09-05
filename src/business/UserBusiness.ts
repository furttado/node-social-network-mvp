import { UserDatabase } from "../data/UserDatabase";
import { IdGenerator } from "../services/IdGenerator";
import { HashManager } from "../services/HashManager";
import { Authenticator } from "../services/Authenticator";
import { User, toUserRole, UserRole } from "../models/UserModel";
import { Friendship } from "../models/Friendship";
import { InputChecker } from "../services/InputChecker";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/notFoundError";
import { UnauthorizedError } from "../errors/Unauthorized Error";
import { PreconditionFailedError } from "../errors/PreconditionFailedError";

export class UserBusiness {
  constructor(
    private userDatabase = new UserDatabase(),
    private idGenerator = new IdGenerator(),
    private hashManager = new HashManager(),
    private inputChecker = new InputChecker(),
    private authenticator = new Authenticator()
  ) {}

  public async register(
    email: string,
    password: string,
    nickname: string,
    name: string,
    picture: string,
    bio: string,
    userRole?: string
  ) {
    const defaultUserRole: string = !userRole ? "ADMIN" : userRole;

    if (!this.inputChecker.checkEmail(email)) {
      throw new BadRequestError("It is not a valid email!");
    }

    if (!this.inputChecker.checkPassWord(password)) {
      throw new BadRequestError(
        "It is not a valid password: Minimum eight characters, must include at least one upper case letter, one lower case letter, one numeric digit and maximum fifty characters"
      );
    }

    if (!this.inputChecker.checkImageUrl(picture)) {
      throw new BadRequestError(
        "It is not a valid image URL: <https><http>://wwww.domain.com/imageName.<jpg/jpeg/png/gif>"
      );
    }

    if (!nickname || !name || !bio) {
      throw new BadRequestError("Missing 'nickname', 'name' or 'bio'");
    }

    const id: string = this.idGenerator.generateId();
    const hashPassword = await this.hashManager.hash(password);

    const user = new User(
      id,
      email,
      hashPassword,
      nickname,
      name,
      picture,
      bio,
      toUserRole(defaultUserRole)
    );

    await this.userDatabase.createUser(user);

    const accessToken = this.authenticator.generateToken({
      id: user.getId(),
      role: user.getUserRole(),
      nickname: user.getNickname(),
    });

    return { accessToken };
  }

  public async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestError("Email and password cannot be empty");
    }

    const userDb = await this.userDatabase.getUserByEmail(email);
    if (!userDb) {
      throw new NotFoundError("User not found");
    }

    const hashPassword = await this.hashManager.compare(password, userDb?.getPassword() as string);

    if (!hashPassword) {
      throw new UnauthorizedError("Invalid password");
    }

    const accessToken = this.authenticator.generateToken({
      id: userDb?.getId() as string,
      role: userDb?.getUserRole(),
      nickname: userDb?.getNickname(),
    });

    const userData = {
      nickname: userDb.getNickname(),
      name: userDb.getName(),
      picture: userDb.getPicture(),
      bio: userDb.getBio(),
    };

    return { accessToken, userData };
  }

  public async getUserById(token: string, followerId: string) {
    if (!token || !followerId) {
      return new BadRequestError("Missing input");
    }

    const tokenData = this.authenticator.getData(token);
    const users = new Friendship(tokenData.id, followerId);
    const user = await this.userDatabase.getUserById(users);
    return user;
  }

  public async getAnyProfile(token: string, followerNickname: string) {
    if (!token || !followerNickname) {
      return new BadRequestError("Missing input");
    }

    const tokenData = this.authenticator.getData(token);
    //const users = new Friendship(tokenData.id, followerNickname);
    const user = await this.userDatabase.getAnyProfile(tokenData.id, followerNickname);

    return user;
  }

  public async getOwnProfile(token: string) {
    if (!token) {
      return new BadRequestError("Missing user token");
    }
    const tokenData = this.authenticator.getData(token);
    return await this.userDatabase.getOwnProfile(tokenData.id);
  }

  public async followUser(token: string, nickname: string) {
    if (!token || !nickname) {
      return new BadRequestError("Missing input");
    }

    const tokenData = this.authenticator.getData(token);
    const users = new Friendship(tokenData.id, nickname);

    if (users.isEqual()) {
      throw new PreconditionFailedError("IDs must be different");
    }

    await this.userDatabase.followUserById(users);
  }

  public async unfollowUser(token: string, nickname: string) {
    if (!token || !nickname) {
      return new BadRequestError("Missing input");
    }

    const tokenData = this.authenticator.getData(token);
    const users = new Friendship(tokenData.id, nickname);

    if (users.isEqual()) {
      throw new PreconditionFailedError("IDs must be different");
    }
    await this.userDatabase.unfollowUser(users);
  }

  public async approve(token: string, nicknameToApprove: string) {
    if (!token || !nicknameToApprove) {
      throw new BadRequestError("Missing input");
    }

    const tokenData = this.authenticator.getData(token);

    /**
     *  change => now the app user will be found in second collumn ('followed')
     * and so, needs to aprove a (follower) = 'idToApprove'
     * */

    const users = new Friendship(nicknameToApprove, tokenData.id);

    await this.userDatabase.approve(users);
  }

  public async editProfile(
    token: string,
    name?: string,
    //nickname?: string,
    picture?: string,
    bio?: string
  ) {
    if (!token) {
      throw new BadRequestError("Authorization token missing");
    }
    if (!name && !picture && !bio) {
      throw new BadRequestError("Enter at least one parameter to change");
    }

    const tokenData = this.authenticator.getData(token);
    await this.userDatabase.editProfile(
      tokenData.id,
      name || undefined,
      //nickname || undefined,
      picture || undefined,
      bio || undefined
    );
  }

  public async editNickname(token: string, nickname: string) {
    if (!token) {
      throw new BadRequestError("Authorization token missing");
    }
    if (!nickname) {
      throw new BadRequestError("Please, provide a new nickname");
    }

    const tokenData = this.authenticator.getData(token);
    const userDb = await this.userDatabase.editNickname(tokenData.id, nickname);

    const accessToken = this.authenticator.generateToken({
      id: userDb.id,
      role: userDb.role,
      nickname: userDb.nickname,
    });

    const user = {
      nickname: userDb.nickname,
      name: userDb.name,
      picture: userDb.picture,
      bio: userDb.bio,
    };

    return {
      accessToken,
      user,
    };
  }
}
