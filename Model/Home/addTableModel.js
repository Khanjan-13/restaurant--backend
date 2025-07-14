const mongoose = require("mongoose");

// Define the schema for adding tables
const addTableSchema = new mongoose.Schema({
  createdBy: { // Updated to 'createdBy' for clarity
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  tableSectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TableSection",
    required: true,
  },
  tableId: {
    type: String,
    required: true,
  },
});

// Export the model
module.exports = mongoose.model("AddTable", addTableSchema, "Tables");
