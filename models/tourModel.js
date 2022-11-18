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
    max: [10, "A group have maximum 10 people"],
    min: [2, "A group should have minimum of 2 people"],
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
    enum: {
      values: ["Easy", "Medium", "Difficult"],
      message: "difficulty shoud be Easy,Medium or Difficult",
    },
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
    validate: {
      validator: function (val) {
        return val > 0;
      },
      message: "Tour price must be grater than zero",
    },
  },
  discount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      message: "Discount should be less then actual price",
    },
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
  secretTour: {
    type: Boolean,
    default: false,
  },
  startDates: [Date],
});

// tourSchema.virtual("totalWees", function () {
//   return this.duration / 7;
// });

// tourSchema.pre("save", function (next) {
//   console.log(this);
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.timeTake = new Date();
  this.find({
    secretTour: {
      $ne: true,
    },
  });
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  next();
});

tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: {
        $ne: true,
      },
    },
  });
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
