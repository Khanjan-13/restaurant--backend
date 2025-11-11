const express = require("express");
const {
  getTableInfo,
  sendOTP,
  verifyOTP,
  placeCustomerOrder,
  getOrderStatus,
  getCustomerOrders,
} = require("../../Controller/Customer/customerOrderController.js");

const router = express.Router();

// Public routes - no authentication required for customers
router.get("/customer/table/:tableId", getTableInfo);
router.post("/customer/send-otp", sendOTP);
router.post("/customer/verify-otp", verifyOTP);
router.post("/customer/place-order", placeCustomerOrder);
router.get("/customer/order-status/:orderId", getOrderStatus);
router.get("/customer/orders/:phoneNumber", getCustomerOrders);

module.exports = router;
