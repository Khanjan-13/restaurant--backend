const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  createdBy: {
    // Updated to 'createdBy' for clarity
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  available: { type: Boolean, required: true, default: true },
});

module.exports = mongoose.model("MenuItem", menuItemSchema, "MenuItem");
