const Review = require("../models/reviewModel");
const ErrorHandler = require("../utils/errorHandler");

const wraptryCatch = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
};

exports.getAllReviews = wraptryCatch(async (req, res, err) => {
  const reviews = await Review.find();
  res.status(200).json({
    status: "success",
    data: reviews,
  });
});

exports.createReview = wraptryCatch(async (req, res, next) => {
  const { review, rating, tour } = req.body;

  const reviewRes = await Review.create({
    review,
    rating,
    tour,
    user: req.user._id,
  });

  if (!reviewRes) {
    return next(
      new ErrorHandler("something went wrong please try again later", 500)
    );
  }

  res.status(201).json({
    status: "success",
    data: reviewRes,
  });
});
