import { MainDatabase } from "./MainDatabase";
import { User } from "../models/UserModel";


export class UserDatabase extends MainDatabase {
    tableName: string = 'user'

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

}


