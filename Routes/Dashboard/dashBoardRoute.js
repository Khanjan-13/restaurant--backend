const express = require("express");
const { getOrderStats } = require("../../Controller/Dashboard/dashBoardController");
const router = express.Router();
const authenticateUser = require("../../authMiddleware.js");

<<<<<<< HEAD
router.get("/order-stats",authenticateUser, getOrderStats);

=======
router.get("/order-stats", getOrderStats);
 
>>>>>>> 81290e8 (stats updated)
module.exports = router;
