const Coupon = require("../../Model/CRM/coupon");

// Create a coupon
const createCoupon = async (req, res) => {
  try {
    const payload = { ...req.body };
    // Normalize fields
    if (typeof payload.code === "string") payload.code = payload.code.trim().toUpperCase();
    if (payload.discountValue != null) payload.discountValue = Number(payload.discountValue);
    if (req.user?.id) payload.createdBy = req.user.id;

    const coupon = new Coupon(payload);
    await coupon.save();
    return res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Get all coupons
const getCoupons = async (_req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: coupons });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get a single coupon by id
const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    return res.json({ success: true, data: coupon });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update coupon
const updateCoupon = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (typeof payload.code === "string") payload.code = payload.code.trim().toUpperCase();
    if (payload.discountValue != null) payload.discountValue = Number(payload.discountValue);
    if (req.user?.id) payload.updatedBy = req.user.id;

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    return res.json({ success: true, data: coupon });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// Delete coupon
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    return res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};