const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/email");
const wraptryCatch = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
};
exports.signUp = wraptryCatch(async (req, res, next) => {
  const { name, email, password, confirmPassword, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
    role,
  });
  if (!user) {
    return next(
      new ErrorHandler("something went wrong please try again later", 500)
    );
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
  user.password = undefined;
  res.status(201).json({
    status: "success",
    token,
    data: user,
  });
});
exports.logIn = wraptryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new ErrorHandler("invalid email or password", 401));
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
  res.status(200).json({
    status: "success",
    token,
  });
});
exports.protect = wraptryCatch(async (req, res, next) => {
  let token;
  //gettting the token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //checking if token is there or not
  if (!token) {
    return next(
      new ErrorHandler(
        "Unauthorized please login first and then try again",
        401
      )
    );
  }
  //check if the token is a valid token or invalid token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if the user id in the token is same as user is claiming
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new ErrorHandler("Unauthorized no user found with please login", 401)
    );
  }

  if (user.isCorrectDateAfterPasswordChange(decoded.iat)) {
    return next(
      new ErrorHandler("you changed password recently please login again", 401)
    );
  }

  req.user = user;

  next();
});

exports.restrictTo = (...args) => {
  return function (req, res, next) {
    if (!args.includes(req.user.role)) {
      return next(
        new ErrorHandler("you haven't access to do this operation", 403)
      );
    }
    next();
  };
};

exports.forgotPasswordCreateToken = wraptryCatch(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("Invalid email please try again", 404));
  }
  //creating the reset passwordtoken
  const resetPasswordToken = user.createForgotPasswordToken();
  //save token in user Database
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetPasswordToken}`;

  try {
    await sendEmail({
      email: user.email,
      text: `Forgot your password ? please send a patch request on this ${resetUrl}.\n if you didn't forgot your password then simply ignore this mail`,
    });
    res.status(200).json({
      status: "success",
      message: "email send successfully for password change",
    });
  } catch (error) {
    console.log(error);
    user.passwordResetToken = undefined;
    user.passwordResetExpireTime = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ErrorHandler(
        "Something went wrong email is not sent please try again later",
        500
      )
    );
  }
});
