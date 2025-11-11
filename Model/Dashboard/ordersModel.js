const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: false, // Optional for customer orders via QR
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null, // For customers ordering via QR code
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    items: [
      {
        itemName: { type: String, required: true },
        itemPrice: { type: Number, required: true },
        itemQuantity: { type: Number, required: true },
        itemCategory: { type: String, default: "" },
        itemDescription: { type: String, default: "" },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: false,
      default: "PENDING",
    },
    tableNumber: {
      type: String,
      default: "N/A",
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AddTable",
      default: null, // Reference to table for QR orders
    },
    orderType: {
      type: String,
      enum: ["DINE_IN", "TAKEAWAY", "DELIVERY", "QR_ORDER"],
      default: "DINE_IN",
    },
    kotGenerated: {
      type: Boolean,
      default: false,
    },
    kotGeneratedAt: {
      type: Date,
      default: null,
    },
    customerPhone: {
      type: String,
      default: null, // Store customer phone for QR orders
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Orders", orderSchema, "Orders");
