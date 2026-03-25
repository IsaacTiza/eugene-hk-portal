import { Router } from "express";
import { getProfile, register, updateProfile } from "../controllers/user.js";
import { forgotPassword, login, protect, resetPassword, updatePassword } from "../middlewares/auth.js";

export const userRouter = Router()

//AUTENTICATION
userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/reset-password/:token', resetPassword)
userRouter.post('/me/update-password', protect, updatePassword)

userRouter.get('/me', protect, getProfile)
userRouter.patch('/me', protect, updateProfile)