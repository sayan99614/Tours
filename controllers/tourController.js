const Tour = require("../models/tourModel");

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "Missing name or price",
    });
  }
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const filQueries = { ...req.query };
    const excludeItems = ["limit", "page", "sort", "fields"];
    excludeItems.forEach((el) => delete filQueries[el]);
    let strQueries = JSON.stringify(filQueries);
    strQueries = strQueries.replace(
      /\b(gte|lte|lt|gt)\b/g,
      (match) => `$${match}`
    );
    const tours = Tour.find(JSON.parse(strQueries));
    const filteredToures = await tours;
    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      results: filteredToures.length,
      data: {
        filteredToures,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "Fail",
      msg: "Something went wrong",
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
