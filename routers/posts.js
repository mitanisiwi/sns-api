const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isAuthenticated = require("../middlewares/isAuthenticated");

const prisma = new PrismaClient();


//新規投稿API
router.post("/post",isAuthenticated, async (req,res) => {
  const { content } =req.body;
  if (!content){
    return res.sendStatus(400).json({message: "投稿内容が空です"});
  }

  try{
    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: req.userId,
      },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });
    res.status(201).json(newPost)
  } catch (err){
    console.error(err);
    res.status(500).json({ massage: "サーバーエラーです。"});
  }

});

//最新投稿取得API
router.get("/get_latest_posts", async(req,res) => {

  try{
    const  latestPosts = await prisma.post.findMany({
      take: 10,
      orderBy: {createdAt: "desc"},
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });
    return res.json(latestPosts);

  }catch(err){
    console.log(err);
    res.status(500).json({message: "サーバーエラーです"});
  }

});

//閲覧しているユーザーのポストを取得
router.get("/:userId", async (req,res) =>{
  const { userId } = req.params;
  try{
    const userPosts = await prisma.post.findMany({
      where: {
        authorId: parseInt(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: true,
      },
    });

    return res.status(200).json(userPosts);
  }catch(err){
    console.log(err);
    res.status(500).json({message: "サーバーエラーです"});
  }
});
module.exports = router;