const Tour = require("../models/tourModel");
const ErrorHandler = require("../utils/errorHandler");
const wraptryCatch = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
};
class ApiFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const filQueries = { ...this.queryString };
    const excludeItems = ["limit", "page", "sort", "fields"];
    excludeItems.forEach((el) => delete filQueries[el]);
    let strQueries = JSON.stringify(filQueries);
    strQueries = strQueries.replace(
      /\b(gte|lte|lt|gt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(strQueries));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort);
    }
    return this;
  }
  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

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

exports.getAllTours = wraptryCatch(async (req, res, next) => {
  const apiFeature = new ApiFeature(Tour.find(), req.query)
    .filter()
    .sort()
    .fields()
    .paginate();
  const filteredToures = await apiFeature.query;
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: filteredToures.length,
    data: {
      filteredToures,
    },
  });
});

exports.getTour = wraptryCatch(async (req, res, next) => {
  const t = await Tour.findById({ _id: req.params.id });

  if (!t) {
    return next(new ErrorHandler("No tour found with the id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      tour: t,
    },
  });
});

exports.createTour = wraptryCatch(async (req, res, next) => {
  const new_tour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      tour: new_tour,
    },
  });
});

exports.updateTour = wraptryCatch(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      tour: updatedTour,
    },
  });
});

exports.deleteTour = wraptryCatch(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new ErrorHandler("wrong id no data found with the id", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
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
