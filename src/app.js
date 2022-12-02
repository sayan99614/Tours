const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { default: helmet } = require("helmet");
const { handleError } = require("../controllers/errorController");
const tourRouter = require("../routes/tourRoutes");
const userRouter = require("../routes/userRoutes");
const reviewRouter = require("../routes/reviewRoute");
const nosqlSanitizer = require("express-nosql-sanitizer");
const xss = require("xss-clean");
const errorHandler = require("../utils/errorHandler");
const hpp = require("hpp");

const app = express();
app.use(helmet());
const limitRequests = rateLimit({
  max: 10,
  windowMs: 60 * 60 * 1000,
  message: "Too many requestes please try after one hour",
});
app.use(
  hpp({
    whitelist: ["duration", "price"],
  })
);
app.use(express.json({ limit: "10kb" }));
// data sanitization against noSQL query injection
app.use(nosqlSanitizer());
// data sanitization against noSQL XSS
app.use(xss());
app.use("/api", limitRequests);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.all("*", (req, res, next) => {
  next(
    new errorHandler(`${req.originalUrl} is not available please check`, 404)
  );
});

app.use(handleError);
module.exports = app;
