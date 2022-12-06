const express = require("express");
const tourController = require("../controllers/tourController");
const { protect, restrictTo } = require("../controllers/authController");
const tourRouter = require("../routes/reviewRoute");
const router = express.Router();

router
  .route("/")
  .get(tourController.getAllTours)
  .post(
    tourController.checkBody,
    protect,
    restrictTo("admin"),
    tourController.createTour
  );

router
  .route("/top-5-cheap")
  .get(tourController.getTop5Cheap, tourController.getAllTours);

router.route("/stats").get(tourController.tourAnalytics);

router.use("/:tourId/reviews", tourRouter);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(protect, restrictTo("admin", "lead-guide"), tourController.updateTour)
  .delete(
    protect,
    restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

router.route("/most-busy/:year").get(tourController.TourInMonths);

module.exports = router;
