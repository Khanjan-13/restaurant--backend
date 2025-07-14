const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
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
      required: true,
    },
    tableNumber: {
      type: String,
      default: "N/A",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Orders", orderSchema, "Orders");
