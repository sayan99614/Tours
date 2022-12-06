const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reqviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "review is a required field"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.SchemaTypes.ObjectID,
      ref: "Tour",
      required: [true, "review must belong to a tour"],
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: [true, "review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reqviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reqviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "-__v -passwordChangedAt",
  });
  next();
});

reqviewSchema.statics.calculateReviewAvg = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        tRatings: {
          $sum: 1,
        },
        aRatings: {
          $avg: "$rating",
        },
      },
    },
  ]);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].tRatings,
    ratingsAverage: stats[0].aRatings,
  });
};

reqviewSchema.post("save", function () {
  this.constructor.calculateReviewAvg(this.tour);
});

module.exports = mongoose.model("Review", reqviewSchema);
