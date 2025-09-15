const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  createdBy: {
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

  // New field for inventory management
  qty: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("MenuItem", menuItemSchema, "MenuItem");
