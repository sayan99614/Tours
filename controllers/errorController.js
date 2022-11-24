const ErrorHandler = require("../utils/errorHandler");

const productionErrHandler = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log(err);
    res.status(500).json({
      message: "Something went wrong plese try again later",
    });
  }
};

const devErrHandler = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
  });
};

const duplicateErrorDB = (err) => {
  const tourName = err.message.match(/"((?:""|[^"])*)"/)[0];
  return new ErrorHandler(`Error: ${tourName} is already present`, 500);
};

const castErrorDB = (err) => {
  return new ErrorHandler(`Error: Invalid tour ${err.path}.`, 400);
};

const validationError = (err) => {
  const error = Object.values(err.errors).map((el) => el.message);
  return new ErrorHandler(`Error: ${error.join(", ")}`, 400);
};
exports.handleError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "production") {
    let error = { message: err.message, ...err };

    if (err.name === "CastError") {
      error = castErrorDB(err);
    }
    if (err.code === 11000) {
      error = duplicateErrorDB(err);
    }
    if (err.name === "ValidationError") {
      error = validationError(err);
    }
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      error = new ErrorHandler("Invalid token please login again", 401);
    }
    productionErrHandler(error, res);
  } else if (process.env.NODE_ENV === "development") {
    devErrHandler(err, res);
  }
};
