import { Router } from "express";
import { adminHardDeleteUser, adminRegisterUser, adminSoftDeleteUser, adminUpdateProfile, getAllUsers, getProfile, getUserById, register, softDeleteUser, updateProfile } from "../controllers/user.js";
import { adminResetPassword, forgotPassword, login, protect, resetPassword, restictTo, updatePassword } from "../middlewares/auth.js";

export const userRouter = Router()

//AUTENTICATION
userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/reset-password/:token', resetPassword)
userRouter.post('/me/update-password', protect, updatePassword)

userRouter.get('/me', protect, getProfile)
userRouter.patch('/me', protect, updateProfile)
userRouter.delete('/me', protect, softDeleteUser)

//ADMIN ROUTES
userRouter.get('/users', protect, restictTo('admin'), getAllUsers)
userRouter.get('/users/:slug', protect, restictTo('admin'), getUserById)
userRouter.delete('/users/:slug', protect, restictTo('admin'), adminSoftDeleteUser)
userRouter.patch('/users/:slug', protect, restictTo('admin'), adminUpdateProfile)
userRouter.post('/users', protect, restictTo('admin'), adminRegisterUser)
userRouter.post('/users/reset-password/:slug', protect, restictTo('admin'), adminResetPassword)
userRouter.delete('/users/:slug', protect, restictTo('admin'), adminHardDeleteUser)
