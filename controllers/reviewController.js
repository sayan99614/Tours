const Review = require("../models/reviewModel");
const ErrorHandler = require("../utils/errorHandler");
const { deleteOne, createOne, updateOne, getOne } = require("./factoryHandler");

const wraptryCatch = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
};

exports.getAllReviews = wraptryCatch(async (req, res, err) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  if (req.params.id) filter = { _id: req.params.id };
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: "success",
    data: reviews,
  });
});

exports.addUserandTour = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.createReview = createOne(Review);
exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);
exports.getReview = getOne(Review);
