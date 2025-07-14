const express = require("express");
const {
  fetchOrderItem,
} = require("../../Controller/Orders/orderStatusController.js");
const authenticateUser = require("../../authMiddleware.js");

const router = express.Router();

router.get("/orders/order-status/:id",authenticateUser, fetchOrderItem);

module.exports = router;
