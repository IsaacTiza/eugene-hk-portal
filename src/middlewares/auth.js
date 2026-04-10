import jwt from "jsonwebtoken";
import User from "../models/User.js";
import signJWT from "../utils/signJWT.js";
import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";
import { saveUserJWT } from "../utils/saveUserJWT.js";


export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    throw new AppError(
      "You are not logged in. Please log in to get access.",
      401,
    );
  }

  let decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || user.isDeleted) {
    throw new AppError(
      "The user belonging to this token does no longer exist.",
      401,
    );
  }
  if (user.changePasswordAfter(decoded.iat)) {
    throw new AppError(
      "User recently changed password! Please log in again.",
      401,
    );
  }
  req.user = user;
  next();
});
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparepassword(password))) {
    throw new AppError("Incorrect email or password", 401);
  }
  const token = signJWT({ id: user._id });
  await saveUserJWT(user.username, token);  
  res.status(200).json({
    status: "success",
    token,
  });
});
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new AppError("Please provide your email address", 400);
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("There is no user with that email address", 404);
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get("host")}/eugene-hk-portal/v1/reset-password/${resetToken}`;

  const response = await sendEmail({
    to: "i2493053@gmail.com",
    subject: "Password Reset Request for HK-Portal API",
    html: `<p>You have requested a password reset. Please click the link below to reset your password:</p><p><a href="${resetURL}">Reset Password</a></p>`,
  });
  if (response.error) {
    console.log("Email sending failed:", response.error);
    user.passwordResetToken = undefined;
    user.passwordExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError("There was an error sending the email. Try again later.", 500);
  }
  console.log(resetURL);
  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
    resetURL,
  });
});
export const resetPassword = catchAsync(async (req, res, next) => {

console.log("Received reset password request with token:", req.params.resetToken);

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordExpiresAt: { $gt: Date.now() },
  }).select('+password');
  if (!user) {
    throw new AppError("Token Expired!", 401);
  }
  
  const { password, passwordConfirm } = req.body
  user.password = password;
  user.passwordConfirm = passwordConfirm
  user.passwordResetToken = undefined;
  user.passwordExpiresAt = undefined;
  await user.save()

  res.status(200).json({
    status: `success`,
    message:`Password Changed Succefully!`
  })
});
export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password')
  const { currentPassword, newPassword, newPasswordConfirm } = req.body

  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    throw new AppError('Please provide all required fields', 400)
  }
  if(!await user.comparepassword(currentPassword)) {
    throw new AppError('Incorrect current password', 401)
  }
  user.password = newPassword
  user.passwordConfirm = newPasswordConfirm
  await user.save()

  const newToken = signJWT({ id: user._id })

  res.status(200).json({
    status: `success`,
    message: `Password Updated Successfully! Please log in again.`,
    token: newToken
  })
})
export const restictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403)
    }
    next()
  }
}

//ADMIN AUTHENTICATION
export const adminResetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ slug: req.params.slug }).select('+password')
  if (!user) {
    user = await User.findById(req.params.slug).select('+password')
  }
  if (!user) { user = await User.findOne({ email: req.params.slug }).select('+password') }
  if (!user) {
    throw new AppError('User not found', 404)
  }
  const { newPassword, newPasswordConfirm } = req.body

  if (!newPassword || !newPasswordConfirm) {
    throw new AppError('Please provide all required fields', 400)
  }
  user.password = newPassword
  user.passwordConfirm = newPasswordConfirm
  user.save()

  res.status(200).json({
    status: `success`,
    message: `Password Updated Successfully! Please log in again.`
  })
})
