const express = require("express");
const tourController = require("../controllers/tourController");

const router = express.Router();

router
  .route("/")
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

router
  .route("/top-5-cheap")
  .get(tourController.getTop5Cheap, tourController.getAllTours);

router.route("/stats").get(tourController.tourAnalytics);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

router.route("/most-busy/:year").get(tourController.TourInMonths);

module.exports = router;
