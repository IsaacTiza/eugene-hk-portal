import { Router } from "express";
import { register } from "../controllers/user.js";
import { login } from "../middlewares/auth.js";

export const userRouter = Router()

userRouter.post('/register', register)
userRouter.post('/login', login)