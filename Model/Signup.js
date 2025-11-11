const mongoose = require("mongoose");

const SignupSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    restaurantName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{10}$/, // Ensure 10-digit numbers
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{6}$/, // Ensure 6-digit numbers
    },
    gstNo: {
      type: String,
      trim: true,
      default: null, // Optional field
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// SignupSchema.methods.generateAuthToken = function () {
//   const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
//     expiresIn: "1d",
//   });
//   return token;
// };

module.exports = mongoose.model("Users", SignupSchema, "Users");
