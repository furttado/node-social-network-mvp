export class Friendship {
    constructor(
        private follower: string, 
        private followed: string
        ){}

    public getFollower() {
        return this.follower
    }
    public getFollowed() {
        return this.followed
    }

    public isEqual() {
        return this.getFollower() === this.getFollowed() && true || false
    }
}