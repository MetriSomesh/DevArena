import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userMiddlewares from "../middlewares/userMiddleware";

const router = express.Router();

const prisma = new PrismaClient();

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "";

//signup with jwt token
router.post("/signup", async (req, res) => {
  const body = await req.body;

  if (!body.name || !body.email || !body.password) {
    res.status(400).json({
      msg: "Invalid body",
    });
    return;
  }

  try {
    const isUserPresent = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (isUserPresent) {
      res.status(400).json({
        msg: "User Already exists",
      });
      return;
    }
    const hasedPass = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hasedPass,
      },
    });
    if (user) {
      const token = await jwt.sign(
        {
          email: body.email,
        },
        JWT_SECRET
      );

      res.status(201).json({
        msg: "user created",
        userDetails: user,
        token: token,
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      msg: "Error creating user in DB",
      error: error,
    });
    return;
  }
});

//signin with jwt token
router.post("/signin", async (req, res) => {
  const body = await req.body;

  if (!body.email || !body.password) {
    res.status(400).json({
      msg: "Invalid body params",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (!user) {
      res.status(404).json({
        msg: "User does not exists!",
      });
      return;
    }
    if (!(await bcrypt.compare(body.password, user.password))) {
      res.status(401).json({
        msg: "Invalid Credentials",
      });
      return;
    }

    const token = await jwt.sign(
      {
        email: user.email,
      },
      JWT_SECRET
    );

    res.status(200).json({
      msg: "User authenticated",
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
      error: error,
    });
  }
});

router.post("/getUserDetails", userMiddlewares, async (req, res) => {
  const body = await req.body;

  if (!body.email) {
    res.status(400).json({
      msg: "Invalid body params",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      res.status(404).json({ msg: "user not found" });
      return;
    }
    res.status(200).json({
      msg: "User found",
      user: user,
    });
    return;
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
      error: error,
    });
    return;
  }
});

router.post("/setupaccount", userMiddlewares, async (req, res) => {
  const body = await req.body;
  if (!body.userid || !body.avatar || !body.stack || !body.username) {
    res.status(400).json({
      msg: "Invalid body params",
    });
    return;
  }

  try {
    const userGameDetails = await prisma.userGameInfo.create({
      data: {
        avatar: body.avatar,
        username: body.username,
        stack: body.stack,
        user: {
          connect: { id: body.userid },
        },
      },
    });

    if (!userGameDetails) {
      res.status(402).json({
        msg: "Failed to create game details record",
      });
      return;
    }
    res.status(201).json({
      msg: "Created game record",
      gameInfo: userGameDetails,
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({
      msg: "something went wrogn",
      error: error,
    });
  }
});

export default router;
