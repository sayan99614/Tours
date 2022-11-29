const ErrorHandler = require("../utils/errorHandler");

const wraptryCatch = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
};

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
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
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
