import AppError from "../utils/appError.js";

// --- MONGOOSE ERRORS ---

const handleCastErrorDB = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)[0];
  return new AppError(`Duplicate field value: ${value}`, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors || {}).map((el) => ({
    field: el.path,
    message: el.message,
  }));

  const message = errors.map((el) => el.message).join(". ");

  return new AppError(message || "Invalid input data", 400, errors);
};

// --- JWT ERRORS ---

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Token expired. Please log in again.", 401);

// --- SEND RESPONSE ---

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message,
    errors: err.errors || null,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors || null,
    });
  }

  // unknown error
  console.error("ERROR 💥", err);

  res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

// --- GLOBAL HANDLER ---

const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Handle known errors
  if (err.name === "CastError") error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  const env = process.env.NODE_ENV || "development";

  if (env === "development") {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
