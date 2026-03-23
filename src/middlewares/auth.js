import jwt from "jsonwebtoken";
import User from "../models/User.js";
import signJWT from "../utils/signJWT.js";
import AppError from "../utils/appError.js";

export const protect = async (req, res, next) => {
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
};
export const login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparepassword(password))) {
        throw new AppError('Incorrect email or password', 401);
    }
    const token = signJWT({ id: user._id });
    res.status(200).json({
        status: 'success',
        token
    });
}