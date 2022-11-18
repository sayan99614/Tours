const express = require("express");
const { handleError } = require("../controllers/errorController");
const tourRouter = require("../routes/tourRoutes");
const userRouter = require("../routes/userRoutes");
const errorHandler = require("../utils/errorHandler");
const app = express();

app.use(express.json());

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.all("*", (req, res, next) => {
  next(
    new errorHandler(`${req.originalUrl} is not available please check`, 404)
  );
});

app.use(handleError);
module.exports = app;
