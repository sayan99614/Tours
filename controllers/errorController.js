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

exports.handleError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "production") {
    productionErrHandler(err, res);
  } else if (process.env.NODE_ENV === "development") {
    console.log("dev server");
    devErrHandler(err, res);
  }
};
