import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

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
    passwordResetToken: String,
    passwordExpiresAt: Date,
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
  },
);

//PASSWORD HASHING
(userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const saltRound = 12;
  this.password = await bcrypt.hash(this.password, saltRound);
  this.passwordConfirm = undefined;
  this.passwordChangedAt = Date.now() - 1000;
}),
  //PASSWORRD HASH COMPARISM
  (userSchema.methods.comparepassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }));

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
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordExpiresAt = Date.now() + 1000 * 60 * 10;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
