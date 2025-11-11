const express = require("express");
const router = express.Router();
const authenticateUser = require("../../authMiddleware.js");
const couponController = require("../../Controller/CRM/couponController");

// CRUD Routes for Coupons
router.post("/", authenticateUser, couponController.createCoupon);
router.get("/", authenticateUser, couponController.getCoupons);
router.get("/code/:code", authenticateUser, couponController.getCouponByCode);
router.get("/:id", authenticateUser, couponController.getCouponById);
router.put("/:id", authenticateUser, couponController.updateCoupon);
router.delete("/:id", authenticateUser, couponController.deleteCoupon);

module.exports = router;