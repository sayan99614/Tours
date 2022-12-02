const express = require("express");
const {
  signUp,
  logIn,
  forgotPasswordCreateToken,
  resetPassword,
  protect,
  updatePassword,
  updateUserData,
  deactiveUser,
  restrictTo,
} = require("../controllers/authController");
const userController = require("./../controllers/userController");

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/forgetPassword", forgotPasswordCreateToken);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updatePassword/", protect, updatePassword);
router.patch("/updateMydata", protect, updateUserData);
router.delete("/deleteMyData", protect, deactiveUser);
router
  .route("/")
  .get(protect, restrictTo("admin"), userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
