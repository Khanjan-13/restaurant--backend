const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      default: "percent",
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // Optional controls (future-ready)
    startDate: { type: Date },
    endDate: { type: Date },
    usageLimit: { type: Number, default: 0 }, // 0 => unlimited
    usageCount: { type: Number, default: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number }, // cap for percent type

    // Audit (optional)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  },
  { timestamps: true }
);

// Indexes
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ status: 1 });

module.exports = mongoose.model("Coupon", couponSchema, "Coupon");