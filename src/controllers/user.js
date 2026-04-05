import AppError from "../utils/appError.js";
import User from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";
import e from "express";

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
export const softDeleteUser = catchAsync(async (req, res, next) => {
  if (!req.user) throw new AppError('Please Login!', 401)
  await User.findByIdAndUpdate(req.user._id, { isDeleted: true })
  res.status(204).json({
    status: `success`,
    data: null
  })
})
 
//ADMIN CONTROLS
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ isDeleted: false }).select('-_id -__v')
  res.status(200).json({
    status: `success`,
    data: {
      users
    }
  })

})
export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-_id -__v')
  if (!user) throw new AppError('User not found', 404)
  res.status(200).json({
    status: `success`,
    data: {
      user
    }
  })
})
export const adminSoftDeleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.slug, { isDeleted: true })
  if (!user) user = await User.findOneAndUpdate({ slug: req.params.slug }, { isDeleted: true })
  if (!user) throw new AppError('User not found', 404)
  res.status(204).json({
    status: `success`,
    data: null
  })
})
export const adminUpdateProfile = catchAsync(async (req, res, next) => {
  const { username, email, role } = req.body
  let user = await User.findByIdAndUpdate(req.params.slug, { username, email, role }, { new: true, runValidators: true }).select('-_id -__v')
  if (!user) user = await User.findOneAndUpdate({ slug: req.params.slug }, { username, email, role }, { new: true, runValidators: true }).select('-_id -__v')
  if (!user) throw new AppError('User not found', 404)
  res.status(200).json({
    status: `success`,
    data: {
      username: user.username,
      email: user.email,
      role: user.role
    }
  })
})
export const adminRegisterUser = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm, role } = req.body
  const newUser = await User.create({ username, email, password, passwordConfirm, role })
  res.status(201).json({
    status: "success",
    data: {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    }
  })
})
export const adminHardDeleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.slug)
  if (!user) user = await User.findOneAndDelete({ slug: req.params.slug })
  if (!user) throw new AppError('User not found', 404)
  res.status(204).json({
    status: `success`,
    data: null
  })
})