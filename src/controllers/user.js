import AppError from "../utils/appError.js";
import User from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";

export const register = catchAsync(async (req, res, next) => {
    console.log(req.body)
  const { username, email, password, passwordConfirm } = req.body;

  if (!username || !email || !password || !passwordConfirm) {
    throw new AppError("Please input all required fields", 400);
  }
console.log("Creating user with data:", { username, email });
  const user = await User.create({
    username,
    email,
    password,
    passwordConfirm,
  });
console.log("User created successfully:", user);
  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
});
