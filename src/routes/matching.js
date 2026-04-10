import express from "express";
import { protect } from "../middlewares/auth.js";
import { discoverUsers, getMyMatches, swipe, unMatch } from "../controllers/matching.js";

export const matchingRouter = express.Router();

matchingRouter.post("/like/:slug", protect, swipe)
matchingRouter.get("/matches", protect, getMyMatches)
matchingRouter.patch("/unmatch/:slug", protect, unMatch)
matchingRouter.get("/discover", protect, discoverUsers)