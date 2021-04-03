// import needed modules
const express = require("express");
const userController = require("../controllers/user-controller");

// create new router
const router = express.Router();

// endpoints / routes
router.post("/user-auth", userController.authenticateUser);
router.post("/user", userController.createUser);
router.put("/user/:id", userController.updateUser);
router.delete("/user/:id", userController.deleteUser);
router.get("/user/:id", userController.getUserById);
router.get("/users", userController.getUsers);
router.put("/user-change-password/:id", userController.changePassword);

// export router
module.exports = router;