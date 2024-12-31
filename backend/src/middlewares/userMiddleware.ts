import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "";

export default async function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = await req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      msg: "Access Denied: No Token Provided",
    });
    return;
  }
  try {
    const decoded = await jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      res.status(401).json({
        msg: "Token Expired",
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
      error: error,
    });
  }
}
