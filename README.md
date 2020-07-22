# Social Network MVP

> It's a simple Rest API project for a Social Network MVP built with TypeScript, NodeJS, and other technologies.
>
> **This MVP has basic objectives for now:**
>
> * create and edit a user.
> * login and authenticate.
> * connect, approve, and disconnect two users.
> * create, edit, and delete a post.
> * get a personalized feed based on friendship.



## 🚀 Technologies

* Node.js
* Express
* Knex
* MySQL
* JWT
* uuid
* brcypt
* nodemon
* VS Code



## 📌 Features / Endpoints

* Register
* Edit Profile
* Login
* Follow
* Unfollow
* Approve Friendship
* Create Post
* Edit Post
* Delete Post
* Get Post's friend
* Feed



## ⚡ Try it yourself

* Swagger: https://app.swaggerhub.com/apis-docs/furttado/SocialApp/1.0
* Insomnia: https://github.com/furttado/node-socialNetwork-MVP/blob/master/Insomnia_Social%20Network.json
  * Download this json file
  
  * Download Insomnia
  
  * Drag and drop json file to Insomnia
  
    

## **:arrow_down:** Clone this project

```bash
# Clone this repository
git clone https://github.com/furttado/node-socialNetwork-MVP

# Go into the repository
$ cd node-socialNetwork-MVP

# Install dependencies
$ yarn install

# Create a MySQL database
# Add and config .env file 

# Start the server
$ yarn start
```



### ▶  MySQL 

#### ▷ The server

* **LOCAL**: You can run a local MySQL server, in which case I recommend Docker service.
* **CLOUD**: try AWS, Azure or even Heroku Data

#### ▷ Queries

* Download MySQL Workbench or some similar app to manage your database.
* Run the following query to create your tables.

```mysql
/*1. creating your database */
CREATE DATABASE social-web-app;
USE social-web-app;

/*2. creating your TABLES*/
CREATE TABLE `user` (
  `id` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(250) NOT NULL,
  `nickname` varchar(30) NOT NULL,
  `name` varchar(50) NOT NULL,
  `picture` varchar(200) NOT NULL,
  `user_role` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nickname_UNIQUE` (`nickname`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `id_UNIQUE` (`id`)
);

CREATE TABLE `post` (
  `post_id` varchar(100) NOT NULL,
  `title` text NOT NULL,
  `post_pic` text NOT NULL,
  `description` text,
  `post_time` datetime NOT NULL,
  `post_role` varchar(30) NOT NULL,
  `author` varchar(100) NOT NULL,
  PRIMARY KEY (`post_id`),
  UNIQUE KEY `post_id` (`post_id`),
  KEY `AUTHOR_idx` (`author`),
  CONSTRAINT `AUTHOR` FOREIGN KEY (`author`) REFERENCES `user` (`id`)
);

CREATE TABLE `friendship` (
  `user_follower` varchar(100) NOT NULL,
  `user_followed` varchar(100) NOT NULL,
  `is_approved` bit(1) DEFAULT b'0',
  KEY `user_follower` (`user_follower`),
  KEY `user_followed` (`user_followed`),
  CONSTRAINT `friendship_ibfk_1` FOREIGN KEY (`user_follower`) REFERENCES `user` (`id`),
  CONSTRAINT `friendship_ibfk_2` FOREIGN KEY (`user_followed`) REFERENCES `user` (`id`)
)
```



### ▶ Environment variables (`.env` file)

* go to root directory => **/**node-socialNetwork-MVP
* create a file `.env` to keep you environment variables
* copy, paste and fill, with your information,  the `.env` file

```
DB_HOST = your-host-address
DB_USER = your-user
DB_PASSWORD = your-password
DB_DATABASE_NAME = your-database-name
JWT_KEY = 'fill with anything like an uuid' 
BCRYPT_COST = 12
ACCESS_TOKEN_EXPIRES_IN = '1d'
```

