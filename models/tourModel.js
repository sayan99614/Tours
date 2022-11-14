const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"],
    unique: true,
    trim: true,
    maxlength: [40, "A tour name must have less or equal then 40 characters"],
    minlength: [10, "A tour name must have more or equal then 10 characters"],
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, "A tour must have a duration"],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have a group size"],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
  },
  difficulty: {
    type: String,
    required: [true, "difficulty is required"],
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
  },
  discription: {
    type: String,
    trim: true,
  },
  summary: {
    type: String,
    trim: true,
    required: [true, "summary is required"],
  },
  imageCover: {
    type: String,
    required: [true, "an cover image is rquired"],
  },
  images: [String],
  creatdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
});

tourSchema.virtual("totalWees", function () {
  return this.duration / 7;
});

tourSchema.pre("save", function (next) {
  console.log(this);
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
