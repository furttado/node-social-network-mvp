import { Request, Response } from "express";
import { PostBusiness } from "../business/PostBusiness";
import { Authenticator } from "../services/Authenticator";
import { MainDatabase } from "../data/MainDatabase";
import { PostDatabase } from "../data/PostDatabase";
import { IdGenerator } from "../services/IdGenerator";

export class PostController {
    private static postBusiness = new PostBusiness(
        new PostDatabase(),
        new IdGenerator(),
        new Authenticator()
    )

    async createPost(req: Request, res: Response){
        try {
            const receivedData = {
                token: req.headers.token as string,
                title: req.body.title,
                picture: req.body.picture, 
                description: req.body.description,
                role: req.body.role,
            }
                
            await PostController.postBusiness.createPost(
                receivedData.token,
                receivedData.title,
                receivedData.picture,
                receivedData.description,
                receivedData.role,
            )
    
            res.status(201).send({message: "Post created successfully"})
        } catch (err) {
            res.status(err.errorCode || 400).send({ message: err.message });
        }
        await MainDatabase.destroyConnection()
    }

    async deletePost(req: Request, res: Response) {
        try {
            const token = req.headers.token as string
            const postId = req.params.id

            await PostController.postBusiness.deletePost(postId, token)

            res.status(200).send({ message: "Post deleted successfully" })
        } catch (err) {
            res.status(err.errorCode || 400).send({ message: err.message });
        }
        await MainDatabase.destroyConnection()
    } 
    
    async getPostByUserId(req: Request, res: Response) {
        try {
            const userId = req.params.id
            const post = await PostController.postBusiness.getPostByUserId(userId)
            
            res.status(200).send(post)
        } catch (err) {
            res.status(err.errorCode || 400).send({ message: err.message });
        }
        await MainDatabase.destroyConnection()
    } 

    async getPostsAndNickname(req: Request, res: Response) {
        try {
            const page = Number(req.params.page)
            const posts = await PostController.postBusiness.getPostsAndNickname(page)

            res.status(200).send(posts)
        } catch (err) {
            res.status(err.errorCode || 400).send({ message: err.message });
        }
        await MainDatabase.destroyConnection()
    }

    async getFeed(req:Request, res: Response) {
        try {
            const token = req.headers.token as string
            const feed = await PostController.postBusiness.getFeed(token)

            res.status(200).send(feed)
        } catch (err) {
            res.status(err.errorCode || 400).send({ message: err.message });
        }
        await MainDatabase.destroyConnection()  
    }
}

