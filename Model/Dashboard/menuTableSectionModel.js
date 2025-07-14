const mongoose = require("mongoose");

const menuTableSchema = new mongoose.Schema({
  createdBy: {
    // Updated to 'createdBy' for clarity
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  tableSection: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model(
  "TableSection",
  menuTableSchema,
  "TableSection"
);
