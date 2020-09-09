import { MainDatabase } from "./MainDatabase";
import { User, toUserRole } from "../models/UserModel";
import { NotFoundError } from "../errors/notFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { Friendship } from "../models/Friendship";
import { PostDatabase } from "./PostDatabase";

export class UserDatabase extends MainDatabase {
  tableName: string = "user";

  private toModel(dbModel?: any): User | undefined {
    return (
      dbModel &&
      new User(
        dbModel.id,
        dbModel.email,
        dbModel.password,
        dbModel.nickname,
        dbModel.name,
        dbModel.picture,
        dbModel.bio,
        toUserRole(dbModel.role),
        (dbModel.posts && dbModel.posts) || undefined
      )
    );
  }

  public async createUser(user: User): Promise<void> {
    try {
      await this.getConnection()
        .insert({
          id: user.getId(),
          email: user.getEmail(),
          password: user.getPassword(),
          nickname: user.getNickname(),
          name: user.getName(),
          picture: user.getPicture(),
          bio: user.getBio(),
          user_role: user.getUserRole(),
        })
        .into(this.tableName);
    } catch (err) {
      const message = err.message;
      if (message.indexOf("ER_DUP_ENTRY") !== -1) {
        if (message.indexOf("nickname_UNIQUE") !== -1) {
          throw new Error("This nickname is already taken");
        } else if (message.indexOf("email_UNIQUE") !== -1) {
          throw new Error("This email is already registered");
        }
      }
      throw new Error(err.message);
    }
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await super.getConnection().select("*").where({ email }).from(this.tableName);

      return this.toModel(result[0]);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  public async getUserById(users: Friendship): Promise<User | undefined> {
    try {
      const queryData = await this.getConnection().raw(`
            SELECT * 
            FROM user
            JOIN friendship
            ON user.id = user_followed 
            AND user_followed = '${users.getFollowed()}' AND user_follower = '${users.getFollower()}' 
            `);

      const data = queryData[0][0];

      if (!data) {
        throw new NotFoundError("User not found");
      }

      if (!this.intToboolean(data.is_approved[0])) {
        throw new Error("User not aproved!");
      }

      const user = new User(
        data.id,
        data.email,
        data.undefined,
        data.nickname,
        data.name,
        data.picture,
        data.bio,
        data.undefined
      );

      const userPosts = await new PostDatabase().getPostsByNickname(user.getNickname());
      user.setPosts(userPosts);

      return user;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  public async getBasicProfile(userId: string): Promise<User | undefined> {
    try {
      const queryData = await this.getConnection()
        .select("*")
        .where({ id: userId })
        .from(this.tableName);

      const data = queryData[0];
      if (!data) {
        throw new NotFoundError("User not found");
      }

      const user = new User(
        data.undefined,
        data.undefined,
        data.undefined,
        data.nickname,
        data.name,
        data.picture,
        data.bio,
        data.undefined
      );
      return user;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  public async getOwnProfile(userId: string): Promise<User | undefined> {
    try {
      const queryData = await this.getConnection()
        .select("*")
        .where({ id: userId })
        .from(this.tableName);

      const data = queryData[0];
      if (!data) {
        throw new NotFoundError("User not found");
      }

      const user = new User(
        data.undefined,
        data.email,
        data.undefined,
        data.nickname,
        data.name,
        data.picture,
        data.bio,
        data.undefined
      );

      const userPosts = await new PostDatabase().getPostsByNickname(data.nickname); // user Id
      user.setPosts(userPosts);

      return user;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  public async getAnyProfile(user1: string, user2: string): Promise<any> {
    try {
      const user2Id = await this.getUserIdByNickname(user2);
      const newUsers = new Friendship(user1, user2Id);
      const isApproved = await this.isApproved(newUsers);
      const isRequested = await this.isFollowing(newUsers);
      if (!isApproved) {
        return {
          isRequested: isRequested,
          user: await this.getBasicProfile(user2Id),
        };
      }
      return {
        isFollowing: true,
        user: await this.getUserById(newUsers),
      };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  public async followUserById(users: Friendship): Promise<void> {
    try {
      const userIdToFollow = await this.getUserIdByNickname(users.getFollowed());
      const newUsers = new Friendship(users.getFollower(), userIdToFollow);

      const isFollowing = await this.isFollowing(newUsers);

      if (isFollowing) {
        throw new ForbiddenError("You are already following this person");
      }

      await this.getConnection()
        .insert({
          user_follower: newUsers.getFollower(),
          user_followed: newUsers.getFollowed(),
        })
        .into("friendship");
    } catch (err) {
      throw new Error(err.message);
    }
  }

  public async unfollowUser(users: Friendship): Promise<any> {
    const userIdToUnfollow = await this.getUserIdByNickname(users.getFollowed());
    const newUsers = new Friendship(users.getFollower(), userIdToUnfollow);

    const isFollowing = await this.isFollowing(newUsers);

    if (isFollowing) {
      await this.getConnection().raw(`
        DELETE FROM friendship 
        WHERE user_follower = '${newUsers.getFollower()}' 
        AND user_followed = '${newUsers.getFollowed()}'
      `);
    } else {
      throw new ForbiddenError("Operation not allowed: users are not connected");
    }
  }

  public async approve(users: Friendship) {
    try {
      const idToApprove = await this.getUserIdByNickname(users.getFollower());
      const newUsers = new Friendship(idToApprove, users.getFollowed());

      const queryData = await this.getConnection().raw(`
            SELECT * 
            FROM friendship
            WHERE user_followed = '${newUsers.getFollowed()}' AND user_follower = '${newUsers.getFollower()}' 
            `);

      const data = queryData[0][0];

      if (data) {
        if (this.intToboolean(data.is_approved[0])) {
          throw new Error("User already approved!");
        }
        await this.getConnection().raw(`
                UPDATE friendship
                SET is_approved = 1
                WHERE user_followed = '${newUsers.getFollowed()}' AND user_follower = '${newUsers.getFollower()}'
                `);
      } else {
        throw new NotFoundError("User not found");
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }

  public async editProfile(
    userId: string,
    name?: string,
    //nickname?: string,
    picture?: string,
    bio?: string
  ): Promise<void> {
    try {
      await this.getConnection()(this.tableName)
        .update({
          name,
          //nickname,
          picture,
          bio,
        })
        .where({ id: userId });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  public async editNickname(userId: string, nickname: string): Promise<any> {
    try {
      const result = await this.getConnection().raw(`
      UPDATE user
        SET nickname = '${nickname}'
      WHERE id = '${userId}';

      UPDATE post
        SET author_nickname = '${nickname}'
      WHERE author = '${userId}';
      
      SELECT * FROM user
      WHERE id = '${userId}'

      `);
      return result[0][2][0];
    } catch (err) {
      if (err.message.indexOf("nickname_UNIQUE") !== -1) {
        throw new Error("This nickname is not available!");
      }
      throw new Error(err.message);
    }
  }

  public async getFollowRequests(userId: string): Promise<any> {
    try {
      const result = await this.getConnection().raw(`
      SELECT  name, nickname, picture
      FROM friendship 
      JOIN user
      ON user_followed = '${userId}' AND is_approved = 0
      AND user.id = user_follower;
      `);
      return result[0];
    } catch (err) {
      throw new Error(err.message);
    }
  }

  private async isFollowing(users: Friendship): Promise<boolean> {
    const result = await this.getConnection()
      .select("*")
      .from("friendship")
      .where("user_follower", "=", users.getFollower())
      .and.where("user_followed", "=", users.getFollowed());

    return (result.length !== 0 && true) || false;
  }

  private async isApproved(users: Friendship): Promise<boolean> {
    const result = await this.getConnection()
      .select("*")
      .from("friendship")
      .where("user_follower", "=", users.getFollower())
      .and.where("user_followed", "=", users.getFollowed())
      .and.where("is_approved", "=", 1);

    return (result.length !== 0 && true) || false;
  }

  private async getUserIdByNickname(nickname: string): Promise<any> {
    try {
      const result = await this.getConnection()
        .select("*")
        .from(this.tableName)
        .where({ nickname });

      const data = result[0];
      return data.id;
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
