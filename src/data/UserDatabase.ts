import { MainDatabase } from "./MainDatabase";
import { User, toUserRole } from "../models/UserModel";
import { NotFoundError } from "../errors/notFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { Friendship } from "../models/Friendship";
import { PostDatabase } from "./PostDatabase";

export class UserDatabase extends MainDatabase {
    tableName: string = 'user'

    private toModel(dbModel?: any) : User | undefined {
        return(
            dbModel &&
            new User(
                dbModel.id,
                dbModel.email,
                dbModel.password,
                dbModel.nickname,
                dbModel.name,
                dbModel.picture,
                toUserRole(dbModel.role),
                dbModel.posts && dbModel.posts || undefined
            )
        )
    }

    public async createUser(user: User): Promise<void> {
        try {
            await this.getConnection() 
            .insert({
                id: user.getId(),
                email: user.getEmail() ,
                password: user.getPassword(),
                nickname: user.getNickname(),
                name: user.getName(),
                picture: user.getPicture(),
                user_role: user.getUserRole()
            })
            .into(this.tableName)

        } catch (err) {
            throw new Error(err.message);
        }
    }

    public async getUserByEmail(email: string): Promise<User | undefined> { 
        try {
            const result = await super.getConnection()
            .select('*')
            .where({email})
            .from(this.tableName)

            return this.toModel(result[0]) 
        } catch (err) {
            throw new Error(err.message);
        }
    }

    public async approve(users: Friendship){
        try {
            const queryData = await this.getConnection().raw(`
            SELECT * 
            FROM friendship
            WHERE user_followed = '${users.getFollowed()}' AND user_follower = '${users.getFollower()}' 
            `)

            const data = queryData[0][0]

            if(data) {
                if(this.intToboolean(data.is_approved[0])) {
                    throw new Error("User already approved!");
                }
                await this.getConnection().raw(`
                UPDATE friendship
                SET is_approved = 1
                WHERE user_followed = '${users.getFollowed()}' AND user_follower = '${users.getFollower()}'
                `)
            } else {
                throw new NotFoundError('User not found')
            } 

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
            `)

            const data = queryData[0][0]

            if (!data) {
                throw new NotFoundError('User not found')
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
                data.undefined
            )

            const userPosts = await new PostDatabase().getPostsByUserId(user.getId()) 
            user.setPosts(userPosts) 
            
            return user;
        } catch(err) {
        throw new Error(err.message);
    }

    }

    public async getOwnProfile(userId: string): Promise<User | undefined> {
        try {
            const queryData = await this.getConnection()
            .select('*')
            .where({userId})
            .from(this.tableName)

            const data = queryData[0][0]
            if (!data) {
                throw new NotFoundError('User not found')
            }

            const user = new User( 
                data.id,
                data.email,
                data.undefined, 
                data.nickname,
                data.name,
                data.picture,
                data.undefined
            )

            const userPosts = await new PostDatabase().getPostsByUserId(user.getId()) 
            user.setPosts(userPosts) 
            
            return user;

        } catch(err) {
            throw new Error(err.message); 
        }
    }

    public async followUserById(users: Friendship): Promise<void> { 
        try {
            const isFollowing = await this.isFollowing(users)

            if (isFollowing) {
                throw new ForbiddenError('You are already following this person')
            }

            await this.getConnection()
                .insert({
                    user_follower: users.getFollower(),
                    user_followed: users.getFollowed()
                })
                .into('friendship')

        } catch (err) {
            throw new Error(err.message);
        }
    }

    public async unfollowUser(users: Friendship): Promise<void> {
        const isFollowing = await this.isFollowing(users)

        if (isFollowing) {
            await this.getConnection()
                .select('*')
                .from('friendship')
                .where('user_follower', '=', users.getFollower())
                .and
                .where('user_followed', '=', users.getFollowed())
                .del()
        } else { 
            throw new ForbiddenError('Operation not allowed: users are not connected');
        }
    } 

    public async editProfile(userId: string, name?:string, nickname?: string, picture?:string): Promise<void> {
        try {
            await this.getConnection()(this.tableName)
            .update({
                name,
                nickname,
                picture
            })
            .where({id: userId})

        } catch(err) {
            throw new Error(err.message); 
        }
    }

    private async isFollowing(users: Friendship): Promise<boolean> {
        const result = await this.getConnection()
        .select('*')
        .from('friendship')
        .where('user_follower', '=', users.getFollower())
        .and
        .where('user_followed', '=', users.getFollowed())
    
       return result.length !== 0 && true || false
    }

}


