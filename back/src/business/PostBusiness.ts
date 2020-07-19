import { PostDatabase } from "../data/PostDatabase"
import { IdGenerator } from "../services/IdGenerator"
import { Authenticator } from "../services/Authenticator"
import { Post, toPostRole, PostsAndNicknameOutput } from "../models/PostModel"

export class PostBusiness {
    private static POST_LIMIT = 5;

    constructor(
        private postDb = new PostDatabase(),
        private idGenerator = new IdGenerator(),
        private authenticator = new Authenticator()
    ) {}

    public async createPost(
        token: string,
        title: string,
        picture: string,
        description: string,
        role: string,
    ) {
        const tokenData = this.authenticator.getData(token)

        const time = new Date()
        const postId = this.idGenerator.generateId()
        const post = new Post(postId, title, picture, description, time, toPostRole(role), tokenData.id)

        await this.postDb.createPost(post)
    }

    public async deletePost(postId: string, token: string) {
        const tokenData = this.authenticator.getData(token)
        await this.postDb.deletePost(postId, tokenData.id)
    }
    
    public async getPostByUserId(userId: string) {
        return await this.postDb.getPostsByUserId(userId)
    }

    public async getPostsAndNickname(page: number) { 
        const offset = PostBusiness.POST_LIMIT * (page - 1) 
        return await this.postDb.getPostsAndNickname(PostBusiness.POST_LIMIT, offset)
    }

    public async getFeed(token: string) {
        const tokenData = new Authenticator().getData(token)
        return await this.postDb.getFeed(tokenData.id)
    }
}