const Tour = require("../models/tourModel");
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

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "Missing name or price",
    });
  }
  next();
};

exports.getTop5Cheap = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,ratingsAverage,price,summary,description";
  next();
};

exports.getAllTours = getAll(Tour);

exports.getTour = getOne(Tour, {
  path: "reviews",
});

exports.createTour = createOne(Tour);
exports.updateTour = updateOne(Tour);
exports.deleteTour = deleteOne(Tour);

exports.tourAnalytics = wraptryCatch(async (req, res, next) => {
  const aggrigatedTours = await Tour.aggregate([
    {
      $group: {
        _id: "$difficulty",
        total: { $sum: 1 },
        avgRatings: { $avg: "$ratingsQuantity" },
        maxDuration: { $max: "$duration" },
        avgDuration: { $avg: "$duration" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);
  res.status(200).json({ result: aggrigatedTours });
});

exports.TourInMonths = wraptryCatch(async (req, res, next) => {
  const year = req.params.year * 1;
  const result = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-30`),
        },
      },
    },

    {
      $group: {
        _id: { $month: "$startDates" },
        tour: { $push: "$name" },
        totalCount: { $sum: 1 },
      },
    },

    {
      $sort: { totalCount: -1 },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  res.status(200).json({
    tours: result,
  });
});
