import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["like", "pass"],
      required: true,
    },
  },
  { timestamps: true },
);

// Prevent a user from swiping the same person twice
likeSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export default mongoose.model("Like", likeSchema);
