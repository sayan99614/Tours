const Review = require("../models/reviewModel");
const ErrorHandler = require("../utils/errorHandler");
const {
  deleteOne,
  createOne,
  updateOne,
  getOne,
  getAll,
} = require("./factoryHandler");

const wraptryCatch = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
};
exports.addUserandTour = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.getAllReviews = getAll(Review);
exports.createReview = createOne(Review);
exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);
exports.getReview = getOne(Review);
