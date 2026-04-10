import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "error",
    message: "Too many requests, please try again after 15 minutes",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: "error",
    message: "Too many login attempts, please try again after 15 minutes",
  },
});

export const swipeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: {
    status: "error",
    message: "Swipe limit reached, please try again after an hour",
  },
});
