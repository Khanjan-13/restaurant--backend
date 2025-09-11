const express = require("express");
const { getOrderStats } = require("../../Controller/Dashboard/dashBoardController");
const router = express.Router();
const authenticateUser = require("../../authMiddleware.js");

router.get("/order-stats", authenticateUser, getOrderStats);

router.get("/order-stats", getOrderStats);

module.exports = router;
