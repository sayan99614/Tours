const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  getAllReviews,
  createReview,
  deleteReview,
  addUserandTour,
  getReview,
  updateReview,
} = require("../controllers/reviewController");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getAllReviews)
  .post(protect, addUserandTour, restrictTo("user"), createReview);

router.route("/:id").get(getReview).patch(updateReview).delete(deleteReview);
module.exports = router;
