const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Users = require("../Model/Signup.js");
const dotenv = require("dotenv");

dotenv.config();
const create = async (req, res) => {
  try {
    const {
      ownerName,
      restaurantName,
      email,
      mobile,
      address,
      city,
      state,
      pincode,
      gstNo,
      password,
    } = req.body;

    // Check if the user already exists (by email or mobile)
    const existingUser = await Users.findOne({
      $or: [{ email }, { mobile }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email or mobile already exists!" });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new Users({
      ownerName,
      restaurantName,
      email,
      mobile,
      address,
      city,
      state,
      pincode,
      gstNo,
      password: hashedPassword, // Store hashed password
    });

    // Save the user to the database
    await newUser.save();

    // Respond with success message (excluding sensitive data)
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        ownerName: newUser.ownerName,
        restaurantName: newUser.restaurantName,
        email: newUser.email,
        mobile: newUser.mobile,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists by email
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Token valid for 7 days
    });

    // Return success response with the token
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserByToken = async (req, res) => {
  try {
    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // console.log("Authenticated User ID:", userId);

    // Retrieve the user data from the database
    const user = await Users.findById(userId).select("-password"); // Exclude password field for security
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Return success response with user data
    res.status(200).json({
      message: "User data retrieved successfully.",
      user,
    });
  } catch (error) {
    console.error("Error finding user data:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

  
  
  module.exports = { create, login, getUserByToken };