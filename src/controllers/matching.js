import Like from "../models/Likes.js";
import Match from "../models/Match.js";
import User from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { sendPushNotification } from "../utils/firebase.js";

export const swipe = catchAsync(async (req, res, next) => {
  const { action } = req.body;
  if (!["like", "pass"].includes(action)) {
    return next(new AppError("Invalid action. Must be 'like' or 'pass'", 400));
  }

  const receiver = await User.findOne({ slug: req.params.slug });
  if (!receiver) return next(new AppError("User not found", 404));

  if (receiver._id.equals(req.user._id)) {
    return next(new AppError("You cannot swipe on yourself", 400));
  }

  const existingLike = await Like.findOne({
    sender: req.user._id,
    receiver: receiver._id,
  });
  if (existingLike) {
    return next(new AppError("You have already swiped on this user", 400));
  }

  await Like.create({ sender: req.user._id, receiver: receiver._id, action });

  let matched = false;
  if (action === "like") {
    const reverseLike = await Like.findOne({
      sender: receiver._id,
      receiver: req.user._id,
      action: "like",
    });
    if (reverseLike) {
      await Match.create({ users: [req.user._id, receiver._id] });
      matched = true;
    }
  }
  // After Match.create()
  if (matched) {
    // Notify the other user they have a new match
    const receiver = await User.findById(receiverId).select("+fcmToken");
    await sendPushNotification(
      receiver.fcmToken,
      "New Match! 🎉",
      `You matched with ${req.user.username}`,
      { type: "match", matchId: match._id.toString() },
    );
  }

  res.status(200).json({
    status: "success",
    matched,
    data: {
      message: matched
        ? "It's a match!"
        : `You have ${action}d ${receiver.username}`,
    },
  });
});
export const getMyMatches = catchAsync(async (req, res, next) => {
  const matches = await Match.find({
    users: req.user._id,
    isActive: true,
  }).populate({
    path: "users",
    select:
      "username slug bio age occupation interests hobbies profilePicture location.city location.country",
    match: { _id: { $ne: req.user._id } },
  });

  res.status(200).json({
    status: "success",
    results: matches.length,
    data: { matches },
  });
});
export const unMatch = catchAsync(async (req, res, next) => {
  const unlikeUser = await User.findOne({ slug: req.params.slug });
  if (!unlikeUser) return next(new AppError("User not found", 404));
  const match = await Match.findOne({
    users: { $all: [req.user._id, unlikeUser._id] },
    isActive: true,
  });
  if (!match) return next(new AppError("You have not matched this User", 404));
  match.isActive = false;
  match.unmatchedAt = Date.now();
  match.unmatchedBy = req.user._id;
  await match.save();

  res.status(200).json({
    status: "success",
    message: `You have unmatched ${unlikeUser.username}`,
  });
});
export const discoverUsers = catchAsync(async (req, res, next) => {
  const { matchPreferences, location, _id } = req.user;

  // Get all already swiped user IDs
  const swipedIds = await Like.find({ sender: _id }).distinct("receiver");

  // Build base query
  const query = {
    _id: { $nin: [...swipedIds, _id] },
    isDeleted: false,
    isActive: true,
    age: {
      $gte: matchPreferences.ageRange.min,
      $lte: matchPreferences.ageRange.max,
    },
  };

  // Apply gender filter only if not "both"
  if (matchPreferences.interestedIn !== "both") {
    query.gender = matchPreferences.interestedIn;
  }

  // Apply location filter only if user has coordinates
  const hasLocation =
    location && location.coordinates && location.coordinates.length === 2;

  if (hasLocation) {
    query.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: location.coordinates,
        },
        $maxDistance: matchPreferences.maxDistance * 1000, // convert km to meters
      },
    };
  }

  const discoveredUsers = await User.find(query).select(
    "username slug bio age gender occupation interests hobbies profilePicture location.city location.country lastActive",
  );

  res.status(200).json({
    status: "success",
    results: discoveredUsers.length,
    data: { users: discoveredUsers },
  });
});
