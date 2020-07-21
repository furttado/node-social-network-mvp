import { Request, Response } from "express";
import { UserBusiness } from '../business/UserBusiness'
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
    )

    async register(req:Request, res: Response) {
        try{
            const receivedData = {
                email: req.body.email, 
                password: req.body.password, 
                nickname: req.body.nickname, 
                name: req.body.name, 
                picture: req.body.picture, 
                role: req.body.role
            }

            const createUserAndGetAccessToken = await UserController.userBusiness
            .register( 
                receivedData.email, 
                receivedData.password, 
                receivedData.nickname, 
                receivedData.name,
                receivedData.picture, 
                toUserRole(receivedData.role)
                )

            res.status(201).send({ accessToken: createUserAndGetAccessToken })
        } catch (err) {
            res.status(err.errorCode || 400).send({ message: err.message });
        }
        await MainDatabase.destroyConnection()
    }

    async login(req: Request, res: Response) {
        try {
            const receivedData = {
                email: req.body.email,
                password: req.body.password
            }

            const accessToken = await new UserBusiness().login(receivedData.email, receivedData.password)

            res.status(200).send({ accessToken })
        } catch (err) {
            res.status(err.errorCode || 400).send({ message: err.message });
        }
        await MainDatabase.destroyConnection()
    }

    async approve(req:Request, res: Response) {
        try {
            const token = req.headers.token as string
            const idToApprove = req.body.idToApprove
        
            await UserController.userBusiness.approve(token, idToApprove)

            res.status(201).send({ message: 'User approved!' })
        }  catch (err) {
            res.status(err.errorCode || 400).send({ message: err.message });
        }
        await MainDatabase.destroyConnection()
    }

    async getUserbyId(req:Request, res: Response) {
        try {
            const id = req.params.id
            const token = req.headers.token as string

            const user = await UserController.userBusiness.getUserById(token, id)

            res.status(200).send(user)
        }  catch (err) {
            res.status(err.errorCode || 400).send({ message: err.message });
        }
        await MainDatabase.destroyConnection()  
    }

    async followUser(req:Request, res: Response) {
        try {
            const token = req.headers.token as string
            const idToFollow = req.body.idToFollow
            
            await UserController.userBusiness.followUser(token, idToFollow)

            res.status(200).send({message: 'Request to follow sent'})
        } catch (err) {
            res.status(err.errorCode || 400).send({ message: err.message });
        }
        await MainDatabase.destroyConnection()  
    }

    async unfollowUser(req:Request, res: Response) {
        try {
            const token = req.headers.token as string
            const idToUnfollow = req.body.idToUnfollow

            await UserController.userBusiness.unfollowUser(token, idToUnfollow)
            
            res.status(200).send({message: 'Success'})
        } catch (err) {
            res.status(err.errorCode || 400).send({ message: err.message });
        }
        await MainDatabase.destroyConnection()  
    }

    async editProfile(req:Request, res: Response) {
        try {
            const token = req.headers.token as string
            const name = req.body.name || undefined
            const nickname = req.body.nickname || undefined
            const picture = req.body.picture || undefined

            await UserController.userBusiness.editProfile(
                token, name || undefined, nickname || undefined, picture || undefined
            )

            res.status(200).send({message: 'Success'})
        } catch (err) {
            res.status(err.errorCode || 400).send({ message: err.message });
        }
        await MainDatabase.destroyConnection()  
    }
}