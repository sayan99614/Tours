const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/userModel");
const { deleteOne, getOne, getAll } = require("./factoryHandler");
const wraptryCatch = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
};

exports.getAllUsers = getAll(User);
exports.getUser = getOne(User);
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "use signup route to create account",
  });
};

exports.setCurrentUser = (req, res, next) => {
  if (req.user) req.params.id = req.user._id;
  next();
};

const filterUserFields = (reqobj, ...fields) => {
  const updatedData = {};
  Object.keys(reqobj).map((el) => {
    if (fields.includes(el)) {
      updatedData[el] = reqobj[el];
    }
  });
  return updatedData;
};

exports.updateUser = wraptryCatch(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new ErrorHandler("this route is not for password changing", 403)
    );
  }
  const filteredUserData = filterUserFields(req.body, "name");
});
exports.deleteUser = deleteOne(User);
