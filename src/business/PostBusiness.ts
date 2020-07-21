import { PostDatabase } from "../data/PostDatabase"
import { IdGenerator } from "../services/IdGenerator"
import { Authenticator } from "../services/Authenticator"
import { Post, toPostRole, PostsAndNicknameOutput } from "../models/PostModel"
import { BadRequestError } from "../errors/BadRequestError";
import { UnauthorizedError } from "../errors/Unauthorized Error";

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
    
    public async getPostByUserId(userId: string, token: string) {
        const isAuthorized = this.authenticator.getData(token)
        if(!isAuthorized) {
            throw new UnauthorizedError('Invalid credentials')
        }
        return await this.postDb.getPostsByUserId(userId)
    }

    public async getPostsAndNickname(page: number, token: string) { 
        const isAuthorized = this.authenticator.getData(token)
        if(!isAuthorized) {
            throw new UnauthorizedError('Invalid credentials')
        }

        const offset = PostBusiness.POST_LIMIT * (page - 1) 
        return await this.postDb.getPostsAndNickname(PostBusiness.POST_LIMIT, offset)
    }

    public async getFeed(token: string) {
        const tokenData = new Authenticator().getData(token)
        return await this.postDb.getFeed(tokenData.id)
    }

    public async editPost(token: string, postId:string, title?:string, picture?: string, description?:string) {
        if(!token) {
            throw new BadRequestError("Authorization token missing");                  
        }
        if(!postId) {
            throw new BadRequestError("Post Id missing");                   
        }
        if(!title && !picture && !description) {
            throw new BadRequestError("Enter at least one parameter to change");                
        }

        const tokenData = this.authenticator.getData(token)
        await this.postDb.editPost(tokenData.id, postId, title || undefined, picture || undefined, description || undefined)

    }

}