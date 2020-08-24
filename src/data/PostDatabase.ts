import { MainDatabase } from "./MainDatabase";
import { Post, toPostRole, PostsAndNicknameOutput, PostFeedOutPut } from "../models/PostModel";

export class PostDatabase extends MainDatabase {
  tableName: string = "post";

  async createPost(post: Post): Promise<void> {
    try {
      await this.getConnection()
        .insert({
          post_id: post.getPostId(),
          title: post.getTitle(),
          post_pic: post.getPicture(),
          description: post.getDescription(),
          post_time: post.getTime(),
          post_role: post.getRole(),
          author: post.getAuthor(),
          author_nickname: post.getAuthorNickname(),
        })
        .into(this.tableName);
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async getPostsByNickname(nickname: string): Promise<Post[]> {
    const posts = await this.getConnection()
      .select("*")
      .where({ author_nickname: nickname })
      .from(this.tableName)
      .orderBy("post_time", "desc");

    if (!posts) {
      return [];
    }

    const postArray: Post[] = [];
    for (let post of posts) {
      const newPost = new Post(
        post.post_id,
        post.title,
        post.post_pic,
        post.description,
        post.post_time,
        post.post_role,
        post.undefined, // undefined
        post.author_nickname
      );
      postArray.push(newPost);
    }
    return postArray;
  }

  async getPostsAndNickname(limit: number, offset: number): Promise<PostsAndNicknameOutput[]> {
    console.log("entrou");
    const result = await this.getConnection().raw(`
    SELECT  *
    FROM post
    JOIN user
    ON user.nickname = post.author_nickname AND user.id = post.author
    LIMIT ${limit}
    OFFSET ${offset}    
        `);

    /*
         SELECT  post_id 'postId', title, description, post_pic 'picture', post_time 'time', author, author_nickname 
            FROM post
            JOIN user
            ON user.nickname = post.autor_nickname AND user.id = post.author
            LIMIT ${limit}
            OFFSET ${offset}           
        */
    const posts = result[0];
    console.log(posts);
    if (posts) {
      const postsArray: PostsAndNicknameOutput[] = [];
      for (let post of posts) {
        postsArray.push({
          postId: post.postId,
          title: post.title,
          picture: post.picture,
          description: post.description,
          time: post.time,
          role: post.role,
          author: {
            nickname: post.author_nickname,
            name: post.name,
            picture: post.picture,
          },
          //author: post.author,
          //nickname: post.nickname,
          //authorNickname: post.author_nickname,
        });
      }

      return postsArray;
    } else {
      return [];
    }
  }

  public async getFeed(userId: string): Promise<PostFeedOutPut[]> {
    const result = await this.getConnection().raw(`
        SELECT post_id, title, post_pic, description, post_time, post_role, author, nickname, name, picture
        FROM post
        JOIN user
        ON user.id = post.author
        JOIN friendship
        ON post.author = friendship.user_followed
        AND friendship.user_follower = '${userId}'
        AND friendship.is_approved = 1
        ORDER BY post_time DESC
        `);

    const posts = result[0];
    if (!posts) {
      return [];
    }

    const feedArray: PostFeedOutPut[] = [];
    for (const post of posts) {
      feedArray.push({
        postId: post.post_id,
        title: post.title,
        picture: post.post_pic,
        description: post.description,
        time: post.post_time,
        role: toPostRole(post.post_role),
        //author: post.author,
        author: {
          nickname: post.nickname,
          name: post.name,
          picture: post.picture,
        },
      });
    }
    return feedArray;
  }

  public async deletePost(postId: string, author: string): Promise<void> {
    try {
      await this.getConnection()(this.tableName)
        .where({ post_id: postId })
        .andWhere({ author })
        .del();
    } catch (err) {
      throw new Error(err.message);
    }
  }

  public async editPost(
    author: string,
    postId: string,
    title?: string,
    picture?: string,
    description?: string
  ) {
    try {
      await this.getConnection()(this.tableName)
        .update({
          title,
          picture,
          description,
        })
        .where({ post_id: postId })
        .and.where({ author });
    } catch (err) {
      throw new Error(err.message);
    }
  }
}
