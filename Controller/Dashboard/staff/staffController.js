const Staff = require("../../Model/Dashboard/staff/staffModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // better from env

// Register Staff
const registerStaff = async (req, res) => {
  try {
    const { name, mobile, email, password, role } = req.body; // include role
    const userId = req.user?.id; // assuming JWT auth middleware adds req.user

    // Check for duplicate email
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const staff = new Staff({
      name,
      mobile,
      email,
      password: hashedPassword,
      role, // add role here
      createdBy: userId,
    });

    await staff.save();

    res.status(201).json({ message: "Staff created", data: staff });
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({ error: error.message });
  }
};

// Login Staff
const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    const staff = await Staff.findOne({ email });
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      {
        id: staff._id,
        role: staff.role, // include role in token
        adminId: staff.createdBy?._id || null,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token, staff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Staff
const getAllStaff = async (req, res) => {
  try {
    const staffList = await Staff.find().populate("createdBy", "name email");

    res.status(200).json({ data: staffList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Staff by ID
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Staff
const updateStaff = async (req, res) => {
  try {
    const { name, mobile, email, role } = req.body; // include role
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { name, mobile, email, role },
      { new: true }
    );

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    res.json({ message: "Staff updated", staff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Staff
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    res.json({ message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerStaff,
  loginStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
};
