import { Router } from "express";
import {
  adminHardDeleteUser,
  adminRegisterUser,
  adminSoftDeleteUser,
  adminUpdateProfile,
  getAllUsers,
  getOthersProfile,
  getProfile,
  getUserById,
  register,
  softDeleteUser,
  updateProfile,
  uploadProfilePicture,
} from "../controllers/user.js";
import {
  adminResetPassword,
  forgotPassword,
  login,
  protect,
  resetPassword,
  restictTo,
  updatePassword,
} from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

export const userRouter = Router();
export const adminRouter = Router();

//AUTENTICATION
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);
userRouter.post("/me/update-password", protect, updatePassword);

userRouter.get("/me", protect, getProfile);
userRouter.patch("/me", protect, updateProfile);
userRouter.patch(
  "/me/profile-picture",
  protect, // your existing auth middleware
  upload.single("profilePicture"),
  uploadProfilePicture,
);
userRouter.delete("/me", protect, softDeleteUser);
userRouter.get("/:slug", protect, getOthersProfile);

//ADMIN ROUTES
adminRouter.get("/users", protect, restictTo("admin"), getAllUsers);
adminRouter.post("/users", protect, restictTo("admin"), adminRegisterUser);
adminRouter.get("/users/:slug", protect, restictTo("admin"), getUserById);
adminRouter.patch(
  "/users/:slug",
  protect,
  restictTo("admin"),
  adminUpdateProfile,
);
adminRouter.delete(
  "/users/:slug/soft",
  protect,
  restictTo("admin"),
  adminSoftDeleteUser,
);
adminRouter.delete(
  "/users/:slug/hard",
  protect,
  restictTo("admin"),
  adminHardDeleteUser,
);
adminRouter.post(
  "/users/reset-password/:slug",
  protect,
  restictTo("admin"),
  adminResetPassword,
);
