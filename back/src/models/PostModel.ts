import { User } from "./UserModel";

export class Post {
    constructor(
        private postId: string,
        private title: string,
        private picture: string,
        private description: string,
        private time: Date,
        private role: PostRole,
        private author: string,
    ) {}

    public getPostId(): string {
        return this.postId
    }
    public getTitle(): string {
        return this.title
    }
    public getPicture(): string {
        return this.picture
    }
    public getDescription(): string {
        return this.description
    }
    public getTime(): Date {
        return this.time
    }
    public getRole(): PostRole {
        return this.role
    }
    public getAuthor(): string {
        return this.author
    }
}

export const toPostRole = (value: string): PostRole => {
    switch(value) {
        case "PUBLIC":
            return PostRole.PUBLIC;
        case "PRIVATE":
            return PostRole.PRIVATE;
        case "FRIENDSONLY":
            return PostRole.FRIENDSONLY;
        default:
            return PostRole.FRIENDSONLY;
    }
}

export enum PostRole {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE",
    FRIENDSONLY = "FRIENDSONLY"
}


export interface PostsAndNicknameOutput{ 
    postId: string,
    title: string,
    picture: string,
    description: string,
    time: Date,
    role: string,
    author: string,
    nickname: string
}

export interface PostFeedOutPut {
    postId: string,
    title: string,
    picture: string,
    description: string,
    time: Date,
    role: PostRole,
    author: string,
    authorNickname: string,
    authorName: string,
    authorPicture: string,
}