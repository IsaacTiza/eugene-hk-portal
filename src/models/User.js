import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import slugify from "slugify";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "User must have a username"],
      unique: [
        true,
        "This username is already registered, pick a new one or login",
      ],
      trim: true,
      minlength: 3,
      maxlength: 50,
      set: (value) => {
        if (!value) return value;
        return value.charAt(0).toUpperCase() + value.slice(1);
      },
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: [
        true,
        "This email is already registered, pick a new one or login",
      ],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Password and Password confirm don't match"],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "passwords don't match",
      },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    passwordResetToken: String,
    passwordExpiresAt: Date,
    passwordChangedAt: Date,
    bio: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    age: {
      type: Number,
      min: 18,
      max: 120,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Please specify your gender"],
    },
    occupation: {
      type: String,
    },
    number: {
      type: String,
      match: [
        /^\+?[1-9]\d{1,14}$/,
        "Please enter a valid phone number with country code",
      ],
    },
    interests: [
      {
        type:String,
      },
    ],
    hobbies: [
      {
        type: String,
      },
    ],
    profilePicture: {
      type: String,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] }, // [longitude, latitude]
      city: { type: String },
      country: { type: String },
    },
    matchPreferences: {
      interestedIn: { type: String, enum: ["male", "female", "both"] },
      ageRange: {
        min: { type: Number, default: 18 },
        max: { type: Number, default: 50 },
      },
      maxDistance: { type: Number, default: 50 }, // km
      hobbies: [{ type: String }],
      interests: [{ type: String }],
    },

    // ── Meta ──
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastActive: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

//PASSWORD HASHING
userSchema.pre("save", async function () {
  console.log("password hashing middleware triggered");
  if (!this.isModified("password")) return;

  const saltRound = 12;
  this.password = await bcrypt.hash(this.password, saltRound);
  this.passwordConfirm = undefined;
  this.passwordChangedAt = Date.now() - 1000;
  console.log("password hashing completed");
});

userSchema.pre("save", async function () {
  console.log("slug middleware triggered");
  if (!this.isModified("username")) return;

  this.slug = slugify(this.username, { lower: true, strict: true, trim: true });
  console.log("slug middleware completed");
});
//PASSWORRD HASH COMPARISM
userSchema.methods.comparepassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordExpiresAt = Date.now() + 1000 * 60 * 10;

  return resetToken;
};

userSchema.index({ location: "2dsphere" });
userSchema.index({ isActive: 1, isDeleted: 1, gender: 1, age: 1 });
userSchema.index({ lastActive: -1 });

const User = mongoose.model("User", userSchema);

export default User;
