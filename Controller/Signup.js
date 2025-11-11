// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const Users = require("../Model/Signup.js");
// const dotenv = require("dotenv");

// dotenv.config();
// const create = async (req, res) => {
//   try {
//     const {
//       ownerName,
//       restaurantName,
//       email,
//       mobile,
//       address,
//       city,
//       state,
//       pincode,
//       gstNo,
//       password,
//     } = req.body;

//     // Check if the user already exists (by email or mobile)
//     const existingUser = await Users.findOne({
//       $or: [{ email }, { mobile }],
//     });
//     if (existingUser) {
//       return res.status(400).json({ message: "User with this email or mobile already exists!" });
//     }

//     // Hash the password securely
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new user
//     const newUser = new Users({
//       ownerName,
//       restaurantName,
//       email,
//       mobile,
//       address,
//       city,
//       state,
//       pincode,
//       gstNo,
//       password: hashedPassword, // Store hashed password
//     });

//     // Save the user to the database
//     await newUser.save();

//     // Respond with success message (excluding sensitive data)
//     res.status(201).json({
//       message: "User created successfully",
//       user: {
//         id: newUser._id,
//         ownerName: newUser.ownerName,
//         restaurantName: newUser.restaurantName,
//         email: newUser.email,
//         mobile: newUser.mobile,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating user:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if the user exists by email
//     const user = await Users.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found!" });
//     }

//     // Compare the provided password with the hashed password in the database
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid email or password!" });
//     }

//     // Generate a JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d", // Token valid for 7 days
//     });

//     // Return success response with the token
//     res.status(200).json({ message: "Login successful", token });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const getUserByToken = async (req, res) => {
//   try {
//     // Ensure the user is authenticated
//     const userId = req.user?.id;
//     if (!userId) {
//       return res.status(401).json({ message: "Authentication required." });
//     }

//     // console.log("Authenticated User ID:", userId);

//     // Retrieve the user data from the database
//     const user = await Users.findById(userId).select("-password"); // Exclude password field for security
//     if (!user) {
//       return res.status(404).json({ message: "User not found!" });
//     }

//     // Return success response with user data
//     res.status(200).json({
//       message: "User data retrieved successfully.",
//       user,
//     });
//   } catch (error) {
//     console.error("Error finding user data:", error);
//     res.status(500).json({ message: "Server error.", error: error.message });
//   }
// };

  
  
//   module.exports = { create, login, getUserByToken };


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

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const { ownerName, email, phone, restaurantName, address } = req.body;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await Users.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists!" });
      }
    }

    // Update user profile
    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(ownerName && { ownerName }),
          ...(email && { email }),
          ...(phone && { mobile: phone }), // Map phone to mobile field
          ...(restaurantName && { restaurantName }),
          ...(address && { address })
        }
      },
      { new: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    // Get user with password
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await Users.findByIdAndUpdate(userId, {
      password: hashedNewPassword
    });

    res.status(200).json({
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { create, login, getUserByToken, updateProfile, changePassword };