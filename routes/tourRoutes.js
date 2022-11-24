const express = require("express");
const tourController = require("../controllers/tourController");
const { protect, restrictTo } = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(protect, tourController.getAllTours)
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

router
  .route("/:id")
  .get(protect, tourController.getTour)
  .patch(protect, tourController.updateTour)
  .delete(
    protect,
    restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

router.route("/most-busy/:year").get(tourController.TourInMonths);

module.exports = router;
