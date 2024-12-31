import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "../prisma/prismaClient";
import bcrypt from "bcrypt";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "";
const CLIENT_ID = process.env.GOOGLE_CLIENT || "";
const CLIENT_ID_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const CALLBACK_URL = process.env.CALLBACK_URL || "";

passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_ID_SECRET,
      callbackURL: CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("ACCESS TOKEN IS: ", accessToken);
        const email = profile.emails![0]!.value;

        let user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user) {
          const password = await bcrypt.hash(JWT_SECRET, 10);
          user = await prisma.user.create({
            data: {
              email: email,
              name: profile!.displayName,
              password: password,
            },
          });
        }
        const token = jwt.sign({ email: user.email }, JWT_SECRET);
        return done(null, { user, token });
      } catch (error) {
        return done(error);
      }
    }
  )
);

router.get("/google", (req, res, next) => {
  console.log("REached to /google reoute");
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    // res.cookie("jwt", token, {
    //   httpOnly: true, // Secure flag, only accessible through HTTP, not JS
    //   secure: process.env.NODE_ENV === "production", // Secure in production
    //   sameSite: "Strict", // Prevent cross-site requests
    //   maxAge: 3600 * 1000, // 1 hour cookie expiration
    // });

    res.status(200).json({ msg: "User authenticated", token });
    return;
  }
);

export default router;
