const express = require("express");
const {
  signUp,
  logIn,
  forgotPasswordCreateToken,
} = require("../controllers/authController");
const userController = require("./../controllers/userController");

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/forgetPassword", forgotPasswordCreateToken);
// router.post("/login", logIn);
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
