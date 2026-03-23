import express from 'express';
import { healthRouter } from './routes/health.js';
import { userRouter } from "./routes/user.js";
import globalErrorHandler from "./middlewares/error.js";
import AppError from "./utils/appError.js";

const app = express();

//MIDDLEWARES
app.use(express.json());

// Request logging middleware
// app.use((req, res, next) => {
//   console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
//   next();
// });

//ROUTES
app.use("/hk-portal/v1", healthRouter);
app.use("/hk-portal/v1/", userRouter);

// app.use((req, res, next) => {
//   console.log(`404 - Route not found: ${req.originalUrl}`);
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });
app.use(globalErrorHandler);

export default app;