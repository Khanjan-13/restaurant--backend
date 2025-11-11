const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  createdBy: {
    // Updated to 'createdBy' for clarity
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Category", categorySchema, "MenuCategory");
