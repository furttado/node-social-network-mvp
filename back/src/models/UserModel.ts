import { Post } from './PostModel'

export class User {
    constructor(
        private id: string,
        private email: string, 
        private password: string, 
        private nickname: string, 
        private name: string, 
        private picture: string, 
        private userRole: UserRole, 
        private posts?: Post[]     
    ) {}
    
    public setPosts(posts: Post[]) {
        this.posts = posts;
    }
    public setName(name: string): void {
        this.name = name
    }
    public getId(): string {
        return this.id;
    }
    public getEmail(): string {
        return this.email
    }
    public getPassword(): string {
        return this.password
    }
    public getNickname(): string {
        return this.nickname
    }
    public getName(): string {
        return this.name
    }
    public getPicture(): string {
        return this.picture
    }
    public getUserRole(): UserRole {
        return this.userRole
    }
}

export enum UserRole {
    BASIC = "BASIC",
    ADMIN = "ADMIN"
}

export const toUserRole = (value: string): UserRole => { 
    switch (value) {
      case "BASIC":
        return UserRole.BASIC;
      case "ADMIN":
        return UserRole.ADMIN;
      default:
        return UserRole.BASIC;
    }
  };

  