import { MainDatabase } from "./MainDatabase";
import { Post, toPostRole, PostsAndNicknameOutput, PostFeedOutPut } from "../models/PostModel";

export class PostDatabase extends MainDatabase {
    tableName: string = 'post'

    async createPost(post: Post): Promise<void> {
        try {
            await this.getConnection()
            .insert({
                post_id: post.getPostId, 
                title: post.getTitle, 
                post_pic: post.getPicture, 
                description: post.getDescription, 
                post_time: post.getTime, 
                post_role: post.getRole, 
                author: post.getAuthor
            })
            .into(this.tableName)

        } catch (err) {
            throw new Error(err.message);
        }
    }

    async getPostsByUserId(userId: string): Promise<Post[]> {
        const posts = await this.getConnection()
            .select('*')
            .where({ author: userId })
            .from(this.tableName)
            .orderBy('DESC')

        if (!posts) { return [] }
        
        const postArray: Post[] = []
        for (let post of posts) {
            const newPost = new Post(
                post.post_id,
                post.title,
                post.post_pic,
                post.description,
                post.post_time,
                post.post_role,
                post.author
            )
            postArray.push(newPost)
        }
        return postArray
    }

    async getPostsAndNickname(limit: number, offset: number): Promise<PostsAndNicknameOutput[]> {
        const result = await this.getConnection().raw(`
            SELECT  post_id 'postId', title, description, post_pic 'picture', post_time 'time', author, nickname
            FROM post
            JOIN user
            ON user.id = post.author
            LIMIT ${limit}
            OFFSET ${offset}            
        `)
        const posts = result[0]

        if (posts) {
            const postsArray: PostsAndNicknameOutput[] = []
            for (let post of posts) {
                postsArray.push(
                    {
                        postId: post.postId,
                        title: post.title,
                        picture: post.picture,
                        description: post.description,
                        time: post.time,
                        role: post.role,
                        author: post.author,
                        nickname: post.nickname
                    }
                )
            }

            return postsArray

        } else {
            return []
        }
    }

    public async getFeed(userId: string): Promise<PostFeedOutPut[]> {
        const result = await this.getConnection().raw(`
        SELECT post_id, title, post_pic, description, post_time, post_role, author, nickname, name, picture
        FROM post
        JOIN user
        ON user.id = post.author
        JOIN friendship
        ON post.author = friendship.user_followed
        AND friendship.user_follower = '${userId}'
        AND friendship.is_approved = 1
        ORDER BY post_time DESC
        `)

        const posts = result[0]
        if (!posts) {
            return []
        }

        const feedArray: PostFeedOutPut[] = []
        for (const post of posts) {
            feedArray.push(
                {
                    postId: post.post_id,
                    title: post.title,
                    picture: post.post_pic,
                    description: post.description,
                    time: post.post_time,
                    role: toPostRole(post.post_role),
                    author: post.author,
                    authorNickname: post.nickname,
                    authorName: post.name,
                    authorPicture: post.picture
                }
            )

        }
        return feedArray
    }

    public async deletePost(postId: string, author:string): Promise<void> {
        try {
            await this.getConnection()
            .select('*')
            .where({postId})
            .and
            .where({author})
            .del()
    
        } catch(err) {
            throw new Error(err.message);
        }
    }

    public async getPostById(postId: string): Promise<Post | undefined> {
        try {
            const result = await this.getConnection()
            .select('*')
            .where({postId})

            const post = result[0]

            return new Post(
                post.post_id, 
                post.title, 
                post.post_pic, 
                post.description, 
                post.post_time, 
                toPostRole(post.post_role), 
                post.author
            )
            
        } catch(err) {
            throw new Error(err.message);
        }

    }
}

