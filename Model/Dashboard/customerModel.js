const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: false, trim: true },
    email: { type: String, required: false, trim: true, lowercase: true },
    address: { type: String, required: false, trim: true },
    notes: { type: String, required: false, trim: true },
    visitCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastVisitAt: { type: Date },
    isActive: { type: Boolean, default: true },
    birthday: { type: Date },
    category: { type: String, trim: true },
    discountPercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Unique per creator if provided
customerSchema.index({ createdBy: 1, phone: 1 }, { unique: false, sparse: true });
customerSchema.index({ createdBy: 1, email: 1 }, { unique: false, sparse: true });

module.exports = mongoose.model("Customer", customerSchema, "Customer");
