const ApiFeature = require("../utils/ApiFeatures");
const ErrorHandler = require("../utils/errorHandler");

const wraptryCatch = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
};
exports.deleteOne = (Model) => {
  return wraptryCatch(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(
        new ErrorHandlerHandler("wrong id no data found with the id", 404)
      );
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  });
};
exports.createOne = (Model) => {
  return wraptryCatch(async (req, res, next) => {
    const new_doc = await Model.create(req.body);
    if (!new_doc) {
      return next(
        new ErrorHandler("somehing went wrong can't create at this moment", 500)
      );
    }
    res.status(201).json({
      status: "success",
      data: new_doc,
    });
  });
};

exports.updateOne = (Model) => {
  return wraptryCatch(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({
      status: "success",
      data: updatedDoc,
    });
  });
};

exports.getOne = (Model, populateOptions) => {
  return wraptryCatch(async (req, res, next) => {
    let t = Model.findById({ _id: req.params.id });
    if (populateOptions) t = t.populate(populateOptions);
    const result = await t;
    if (!result) {
      return next(new ErrorHandler("No data found with the id", 404));
    }
    res.status(200).json({
      status: "success",
      data: result,
    });
  });
};

exports.getAll = (Model) => {
  return wraptryCatch(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId }; // this is for getting reviews by tour id

    const apiFeature = new ApiFeature(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .paginate();
    const filteredDocuments = await apiFeature.query;

    if (!filteredDocuments)
      return next(
        new ErrorHandler("something went wrong please try again", 500)
      );
    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      results: filteredDocuments.length,
      data: filteredDocuments,
    });
  });
};
