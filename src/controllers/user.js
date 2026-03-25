import AppError from "../utils/appError.js";
import User from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";

export const register = catchAsync(async (req, res, next) => {
    console.log(req.body)
  const { username, email, password, passwordConfirm } = req.body;

  if (!username || !email || !password || !passwordConfirm) {
    throw new AppError("Please input all required fields", 400);
  }
  const user = await User.create({
    username,
    email,
    password,
    passwordConfirm,
  });
  res.status(201).json({
    status: "success",
    data: {
      username: user.username,
      email: user.email
    },
  });
});
export const getProfile = catchAsync(async (req, res, next) => { 
  if (!req.user) throw new AppError('Please Login!', 401)
  const user = await User.findById(req.user._id)
  res.status(200).json({
    status: `success`,
    data: {
      username: user.username,
      email: user.email,
    }
  })
})

export const updateProfile = catchAsync(async (req, res, next) => {
  if (!req.user) throw new AppError('Please Login!', 401)
  const { username, email } = req.body
  const user = await User.findByIdAndUpdate(req.user._id, { username, email }, { new: true, runValidators: true }).select('-_id -__v')
  res.status(200).json({
    status: `success`,
    data: {
      user
    }
  })
})