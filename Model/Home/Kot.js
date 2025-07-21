const mongoose = require("mongoose");

const kotSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  tokenNumber: {
    type: Number,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  itemPrice: {
    type: Number,
    required: true,
  },
  itemQuantity: {
    type: Number,
    required: true,
  },
  itemDescription: {
    type: String,
    required: false,
  },
  itemCategory: {
    type: String,
    required: false,
  },
  tableNumber: {
    type: String,
    required: false,
  },
  totalAmount: {
    type: Number,
    required: false,
  },
  orderStatus: {
    type: Boolean,
    required: true,
  },
  isKot: {
    type: Boolean,
    default: true,
  },
},
{
  timestamps: true, // Automatically manage createdAt and updatedAt
});

module.exports = mongoose.model("Kot", kotSchema, "Kot");
