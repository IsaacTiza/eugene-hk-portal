import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    unmatchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    unmatchedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Prevent duplicate matches between same two users
matchSchema.index({ users: 1 }, { unique: true });

export default mongoose.model("Match", matchSchema);
