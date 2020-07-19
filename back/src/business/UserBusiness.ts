import { UserDatabase } from '../data/UserDatabase'
import { IdGenerator } from '../services/IdGenerator'
import { HashManager } from '../services/HashManager';
import { Authenticator } from '../services/Authenticator';
import { User, toUserRole} from '../models/UserModel';
import { Friendship } from '../models/Friendship';
import { InputChecker } from '../services/InputChecker';
import { BadRequestError } from '../errors/BadRequestError';
import { NotFoundError } from '../errors/notFoundError';
import { UnauthorizedError } from '../errors/Unauthorized Error';
import { PreconditionFailedError } from '../errors/PreconditionFailedError';

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
        userRole: string
    ) {
        
        if(!this.inputChecker.checkEmail(email)) {
            throw new BadRequestError('It is not a valid email!')
        }
        
        if(!this.inputChecker.checkPassWord(password)) {
            throw new BadRequestError('It is not a valid password: Minimum eight characters, must include at least one upper case letter, one lower case letter, one numeric digit and maximum fifty characters')
        }

        if(!this.inputChecker.checkImageUrl(picture)) {
            throw new BadRequestError('It is not a valid image URL: <https><http>://wwww.domain.com/imageName.<jpg/jpeg/png/gif>');    
        }

        if(!nickname || !name || !userRole) {
            throw new BadRequestError("Missing 'nickname', 'name' or 'UserRole'"); 
        }

        const id: string = this.idGenerator.generateId()
        const hashPassword = await this.hashManager.hash(password)

        const user = new User(id, email, hashPassword, nickname, name, picture, toUserRole(userRole))

        await this.userDatabase.createUser(user)

        const accessToken = this.authenticator.generateToken({ 
            id: user.getId(), 
            role: user.getUserRole()
        })

        return accessToken
    }

    public async login(email: string, password: string) {
        if(!email || !password) {
            throw new BadRequestError("Email and password cannot be empty");        
        }

        const userDb = await this.userDatabase.getUserByEmail(email)
        if(!userDb) {
            throw new NotFoundError("User not found");  
        }

        const hashPassword = await this.hashManager.compare(password, userDb?.getPassword() as string)
        
        if(!hashPassword) {
            throw new UnauthorizedError('Invalid password');    
        }
        
        const accessToken = this.authenticator.generateToken({
            id: userDb?.getId() as string,
            role: userDb?.getUserRole()
            })

        return accessToken

    }

    public async approve(token: string, idToApprove: string) {
        if(!token || !idToApprove) {
            throw new BadRequestError("Missing input");   
        }

        const tokenData = this.authenticator.getData(token)
        
        /**
         *  change => now the app user will be found in second collumn ('followed')
         * and so, needs to aprove a (follower) = 'idToApprove'
         * */ 
        const users = new Friendship(idToApprove, tokenData.id) 

        await this.userDatabase.approve(users)
    }

    public async getUserById(token: string, followerId: string) { 
        if(!token || !followerId) {
            return new BadRequestError('Missing input')
        }

        const tokenData = this.authenticator.getData(token)
        const users = new Friendship(tokenData.id, followerId) 
        const user = await this.userDatabase.getUserById(users)
        return user
    }

    public async followUser(token: string, userId: string) {
        if(!token || !userId) {
            return new BadRequestError('Missing input')
        }

        const tokenData = this.authenticator.getData(token)
        const users = new Friendship(tokenData.id, userId)

        if(users.isEqual()) {
            throw new PreconditionFailedError("IDs must be different")
        }
        
        await this.userDatabase.followUserById(users)    
    }

    public async unfollowUser(token: string, userId: string) {
        if(!token || !userId) {
            return new BadRequestError('Missing input')
        }

        const tokenData = this.authenticator.getData(token)
        const users = new Friendship(tokenData.id, userId)
        
        if (users.isEqual()) {
            throw new PreconditionFailedError("IDs must be different")
        } 

        await this.userDatabase.unfollowUser(users)
    }
}

