import express from "express";
import { healthRouter } from "./routes/health.js";
import { adminRouter, userRouter } from "./routes/user.js";
import globalErrorHandler from "./middlewares/error.js";
import AppError from "./utils/appError.js";
import path from "path";
import { fileURLToPath } from "url";
import { matchingRouter } from "./routes/matching.js";
import qs from 'qs'
import { messageRouter } from "./routes/message.js";
import morgan from "morgan";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
//MIDDLEWARES
app.use(express.json());
app.set('query parser', str => qs.parse(str));
app.use(morgan('dev'));

//ROUTES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/hk-portal/v1", healthRouter);
app.use("/hk-portal/v1/", userRouter);
app.use("/hk-portal/v1/admin", adminRouter);
app.use("/hk-portal/v1/match", matchingRouter);
app.use("/hk-portal/v1/message", messageRouter);

app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.originalUrl}`);
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

export default app;
