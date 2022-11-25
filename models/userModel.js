const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is a rquired field"],
    trim: true,
    min: 5,
    max: 20,
  },
  email: {
    type: String,
    required: [true, "email is a rquired field"],
    trim: true,
    unique: true,
    validate: {
      validator(value) {
        return value.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g);
      },
      message: "please enter a valid email",
    },
  },
  photo: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: {
      values: ["user", "admin", "guide", "lead-guide"],
      message: "please provid a valid value ",
    },
    default: "user",
  },
  password: {
    type: String,
    required: [true, "password is a rquired field"],
    trim: true,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "password is a rquired field"],
    trim: true,
    validate: {
      validator(val) {
        return val === this.password;
      },
      message: "passwords are not same",
    },
  },
  passwordResetToken: String,
  passwordResetExpireTime: Date,
  passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
userSchema.methods.isCorrectPassword = async (userPassword, password) => {
  return await bcrypt.compare(userPassword, password);
};

userSchema.methods.isCorrectDateAfterPasswordChange = function (tokenDate) {
  if (this.passwordChangedAt) {
    const actualChangedDate = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return tokenDate < actualChangedDate;
  }
};
userSchema.methods.createForgotPasswordToken = function () {
  const plainToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(plainToken)
    .digest("hex");
  this.passwordResetToken = hashedToken;
  this.passwordResetExpireTime = Date.now() + 10 * 60 * 1000;

  console.log(plainToken, hashedToken);
  return plainToken;
};
module.exports = mongoose.model("User", userSchema);
