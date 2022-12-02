const mongoose = require("mongoose");

const reqviewSchema = new mongoose.Schema({
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
    unique: [true, "user can't review tour multiple times"],
  },
});

reqviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "-__v -passwordChangedAt",
  });
  next();
});

module.exports = mongoose.model("Review", reqviewSchema);
