import express from 'express'
import { PostController } from '../controller/PostController'

export const postRouter = express.Router()

postRouter.post('/create', new PostController().createPost)
postRouter.delete('/:id', new PostController().deletePost)
postRouter.get('/user/:id', new PostController().getPostByUserId)
postRouter.get('/all/:page', new PostController().getPostsAndNickname)
postRouter.get('/feed', new PostController().getFeed)
postRouter.post('/edit', new PostController().editPost)