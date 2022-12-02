const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const ErrorHandler = require("../utils/errorHandler");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const wraptryCatch = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
};
const createJWTtoken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
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
  const token = createJWTtoken(user._id);
  // jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.EXPIRES_IN,
  // });
  user.password = undefined;
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
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
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
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

exports.resetPassword = wraptryCatch(async (req, res, next) => {
  const token = req.params.token;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("password and confirm  password has to me same", 400)
    );
  }

  if (!token) {
    return next(new ErrorHandler("invalid token please try again", 400));
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpireTime: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Token is not valid generate new token and try again",
        400
      )
    );
  }

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpireTime = undefined;

  await user.save();
  const jwttoken = createJWTtoken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", jwttoken, cookieOptions);
  res.status(200).json({
    status: "success",
    message: "Password changed successfully !!",
    token: jwttoken,
  });
});

exports.updatePassword = wraptryCatch(async (req, res, next) => {
  const { password, newPassword, confirmnewPassword } = req.body;
  if (newPassword !== confirmnewPassword) {
    return next(new ErrorHandler("password mismatched please try again", 400));
  }
  const user = await User.findById(req.user._id).select("+password");

  if (await user.isCorrectPassword(password, user.password)) {
    user.password = newPassword;
    user.confirmPassword = confirmnewPassword;
    await user.save();
    const token = createJWTtoken(user._id);
    res.status(200).json({
      status: "success",
      message: "password changed successfully!!",
      token,
    });
  } else {
    return next(
      new ErrorHandler("password incorrect please try forgot password", 400)
    );
  }
});

const filterUserFields = (reqobj, ...fields) => {
  const updatedData = {};
  Object.keys(reqobj).map((el) => {
    if (fields.includes(el)) {
      updatedData[el] = reqobj[el];
    }
  });
  return updatedData;
};

exports.updateUserData = wraptryCatch(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new ErrorHandler("this route is not for password changing", 403)
    );
  }
  const filteredUserData = filterUserFields(req.body, "name");

  const user = await User.findByIdAndUpdate(req.user._id, filteredUserData, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.deactiveUser = wraptryCatch(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {
    active: false,
  });
  res.status(204).json({
    status: "success",
  });
});
