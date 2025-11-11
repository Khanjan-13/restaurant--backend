const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true }, // phone is usually unique
    email: { type: String }, // optional
    address: { type: String },

    notes: { type: String }, // staff can add custom notes
    discount: { type: Number, default: 0 }, // default 0, applied to bill if any

    status: {
      type: String,
      enum: ["friend", "family", "vip"],
      default: "friend",
    },

    lastInteraction: { type: Date }, // last visit / order date
    totalVisits: { type: Number, default: 0 }, // how many times customer visited
    totalSpend: { type: Number, default: 0 }, // lifetime spend

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users", // staff who added customer
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema, "Customer");
