import mongoose from 'mongoose';
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'User must have a username'],
    unique: [true, 'This username is already registered, pick a new one or login'],
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: [true, 'This email is already registered, pick a new one or login'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, "The user must confirm the pasword"],
    validate: {
      validator: function (val) {
        return val === this.password
      },
      message:"passwords don't match"
    }
  },

}, {
  timestamps: true,
});

//PASSWORD HASHING
userSchema.pre('save', async function (next) {
  if (!this.isModified("password")) return next()
  const saltRound = 12;
  this.password = await bcrypt.hash(this.password, saltRound)
  next()
}),
  //PASSWORRD HASH COMPARISM
userSchema.method.comparepassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword,this.password)
}

const User = mongoose.model('User', userSchema);

export default User;