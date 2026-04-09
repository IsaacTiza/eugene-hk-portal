import AppError from "../utils/appError.js";
import User from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";

export const register = catchAsync(async (req, res, next) => {
  console.log("first logging", req.body);
  const {
    username,
    email,
    password,
    passwordConfirm,
    gender,
    age,
    bio,
    occupation,
    number,
    interests,
    hobbies,
    location,
    matchPreferences,
  } = req.body;

  if (!username || !email || !password || !passwordConfirm) {
    throw new AppError("Please input all required fields", 400);
  }
  const user = await User.create({
    username,
    email,
    password,
    passwordConfirm,
    gender,
    age,
    bio,
    occupation,
    number,
    interests,
    hobbies,
    location,
    matchPreferences,
  });
  res.status(201).json({
    status: "success",
    data: {
      username: user.username,
      email: user.email,
    },
  });
});
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    "-password -__v -passwordResetToken -passwordExpiresAt -passwordChangedAt",
  );

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: { user },
  });
});
export const getOthersProfile = catchAsync(async (req, res, next) => {
  const userSlug = req.params.slug;
  const user = await User.findOne({ slug: userSlug, isDeleted: false }).select(
    "-password -__v -passwordResetToken -passwordExpiresAt -passwordChangedAt -email -number -isDeleted -isActive -isVerified -matchPreferences -role -location.coordinates",
  );
  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = [
    "bio",
    "age",
    "occupation",
    "interests",
    "hobbies",
    "number",
    "matchPreferences",
    "location",
  ];

  // Only keep fields that were actually sent
  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    return next(new AppError("No valid fields provided for update", 400));
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    returnDocument: "after",
    runValidators: true,
  }).select("-password -__v -passwordResetToken -passwordExpiresAt");

  res.status(200).json({
    status: "success",
    data: { user },
  });
});
export const uploadProfilePicture = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("Please upload an image", 400));

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/profilePictures/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profilePicture: imageUrl },
    { returnDocument: "after", runValidators: true },
  );

  res.status(200).json({
    status: "success",
    data: { profilePicture: user.profilePicture },
  });
});
export const softDeleteUser = catchAsync(async (req, res, next) => {
  if (!req.user) throw new AppError("Please Login!", 401);
  await User.findByIdAndUpdate(req.user._id, { isDeleted: true });
  res.status(204).json({
    status: `success`,
    data: null,
  });
});

//ADMIN CONTROLS
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ isDeleted: false }).select("-_id -__v");
  res.status(200).json({
    status: `success`,
    data: {
      users,
    },
  });
});
export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-_id -__v");
  if (!user) throw new AppError("User not found", 404);
  res.status(200).json({
    status: `success`,
    data: {
      user,
    },
  });
});
export const adminSoftDeleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.slug, {
    isDeleted: true,
  });
  if (!user)
    user = await User.findOneAndUpdate(
      { slug: req.params.slug },
      { isDeleted: true },
    );
  if (!user) throw new AppError("User not found", 404);
  res.status(204).json({
    status: `success`,
    data: null,
  });
});
export const adminUpdateProfile = catchAsync(async (req, res, next) => {
  const { username, email, role } = req.body;
  let user = await User.findByIdAndUpdate(
    req.params.slug,
    { username, email, role },
    { new: true, runValidators: true },
  ).select("-_id -__v");
  if (!user)
    user = await User.findOneAndUpdate(
      { slug: req.params.slug },
      { username, email, role },
      { new: true, runValidators: true },
    ).select("-_id -__v");
  if (!user) throw new AppError("User not found", 404);
  res.status(200).json({
    status: `success`,
    data: {
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});
export const adminRegisterUser = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({
    username,
    email,
    password,
    passwordConfirm,
    role,
  });
  res.status(201).json({
    status: "success",
    data: {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    },
  });
});
export const adminHardDeleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.slug);
  if (!user) user = await User.findOneAndDelete({ slug: req.params.slug });
  if (!user) throw new AppError("User not found", 404);
  res.status(204).json({
    status: `success`,
    data: null,
  });
});
