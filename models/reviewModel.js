const mongoose = require("mongoose");

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

module.exports = mongoose.model("Review", reqviewSchema);
