import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import passport from "passport";
import authRoutes from "./routes/authRoutes";
const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
