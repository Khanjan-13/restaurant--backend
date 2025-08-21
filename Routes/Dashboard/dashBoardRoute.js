const express = require("express");
const { getOrderStats } = require("../../Controller/Dashboard/dashBoardController");
const router = express.Router();

router.get("/order-stats", getOrderStats);

module.exports = router;
