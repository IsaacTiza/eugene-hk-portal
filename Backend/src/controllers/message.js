import AppError from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import User from "../models/User.js";
import Match from "../models/Match.js";
import Message from "../models/Message.js";
import APIFeatures from "../utils/apiFeatures.js";
import mongoose from "mongoose";

export const getConversations = catchAsync(async (req, res, next) => {
const {matchId} = req.params;
    const match = await Match.findById(matchId);
   if (!match || !match.users.some((id) => id.equals(req.user._id))) {
     return next(new AppError("Match not found or access denied", 404));
   }
    const features = new APIFeatures(Message.find({ match: matchId, isDeleted: false }), req.query).sort().paginate().limitFields();
    const messages = await features.query.populate("sender", "username profilePicture");
    res.status(200).json({
        status: 'success',
        results: messages.length,
        data: {
            messages
        }
    })    
})
export const getUnreadCount = catchAsync(async (req, res, next) => {
  const unread = await Message.aggregate([
    {
      $match: {
        receiver: new mongoose.Types.ObjectId(req.user._id),
        isDeleted: false,
        isRead: false,
      },
    },
    { $group: { _id: "$match", newMessages: { $sum: 1 } } },
    { $project: { matchId: "$_id", newMessages: 1, _id: 0 } },
  ]);
  res.status(200).json({
    status: "success",
    data: { unread },
  });
});
