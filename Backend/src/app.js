import express from "express";
import { healthRouter } from "./routes/health.js";
import { adminRouter, userRouter } from "./routes/user.js";
import globalErrorHandler from "./middlewares/error.js";
import AppError from "./utils/appError.js";
import path from "path";
import { fileURLToPath } from "url";
import { matchingRouter } from "./routes/matching.js";
import qs from "qs";
import { messageRouter } from "./routes/message.js";
import morgan from "morgan";
import { globalLimiter } from "./middlewares/rateLimiters.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import sanitize from "mongo-sanitize";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corsOptions = {
  origin: process.env.FRONTEND_URL, // your frontend domain
  credentials: true, // allows cookies to be sent cross-origin
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
const app = express();
//MIDDLEWARES
app.use(globalLimiter);

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ strict: true }));
app.set("query parser", (str) =>
  qs.parse(str, { allowDots: true, allowPrototypes: false }),
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use((req, res, next) => {
  req.body = sanitize(req.body);
  req.params = sanitize(req.params);
  // Don't reassign req.query — sanitize in place instead
  Object.keys(req.query).forEach((key) => {
    req.query[key] = sanitize(req.query[key]);
  });
  next();
});
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
