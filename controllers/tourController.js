const Tour = require("../models/tourModel");

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

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "Fail",
      msg: error,
    });
  }
};

exports.getTour = async (req, res) => {
  const t = await Tour.findById({ _id: req.params.id });
  res.status(200).json({
    status: "success",
    data: {
      tour: t,
    },
  });
};

exports.createTour = async (req, res) => {
  try {
    const new_tour = await Tour.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        tour: new_tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      msg: "Something went wrong ! please try again",
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        tour: updatedTour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      msg: "something went wrong !!",
    });
  }
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: "success",
    data: null,
  });
};
exports.tourAnalytics = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      status: "fail",
      msg: error,
    });
  }
};

exports.TourInMonths = async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "fail",
      msg: error,
    });
  }
};
