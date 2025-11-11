const AddTable = require("../../Model/Home/addTableModel.js");
const crypto = require("crypto");

const addTableinDB = async (req, res) => {
  try {
    const { tableSectionId, tableId } = req.body;
  
    // Ensure the user is authenticated
    const userId = req.user?.id;
    console.log("User ID:", userId);
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
  
    console.log("Request Body:", req.body);
  
    // Check for duplicate entries
    const tableIdExist = await AddTable.findOne({
      tableId,
      tableSectionId,
      createdBy: userId,
    });
    console.log("Duplicate Check Result:", tableIdExist);
    if (tableIdExist) {
      return res.status(400).json({ message: "Table ID already exists" });
    }
  
    // Create a new table entry with temporary QR data
    const newAddTable = new AddTable({
      tableSectionId,
      tableId,
      createdBy: userId,
      qrCodeData: "temp", // Temporary placeholder
    });
    const savedTable = await newAddTable.save();

    // Generate QR code data with table ID - Point to welcome page
    const token = crypto.randomBytes(16).toString("hex");
    const baseUrl = "https://beta--tableno21.netlify.app";
    const qrCodeData = `${baseUrl}/customer/welcome/${savedTable._id}?token=${token}`;

    // Update table with QR code data
    savedTable.qrCodeData = qrCodeData;
    const result = await savedTable.save();
  
    console.log("New Table Created:", result);
    res.status(200).json({ 
      message: "Table created successfully", 
      result,
      qrCodeData // Send QR data to frontend for QR image generation
    });
  } catch (error) {
    console.error("Error creating table:", error);
    res.status(500).json({ errorMessage: error.message });
  }
  
};

const getAllTable = async (req, res) => {
  try {
    const { id: userId, adminId } = req.user;
    console.log("req.user:", req.user);

    const creatorId = adminId || userId; // If waiter, use adminId. If admin, use their own ID.


    // Fetch tables created by the authenticated user
    const tableData = await AddTable.find({ createdBy: creatorId }).populate(
      "tableSectionId",
      "tableSection -_id" // Populate only necessary fields
    );

    if (!tableData || tableData.length === 0) {
      console.log("No table data found for this user.");
      return res
        .status(404)
        .json({ message: "No table data found for this user." });
    }

    // Respond with the fetched data
    res.status(200).json(tableData);
  } catch (error) {
    console.error("Error fetching table data:", error.message);
    res
      .status(500)
      .json({ errorMessage: "Server error. Please try again later." });
  }
};

const deleteTable = async (req, res) => {
  try {
    const { id } = req.params; // This can be either `id` or `tableSectionId`.

    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // let tables;

    // Determine whether the input is `id` or `tableSectionId`

    const table = await AddTable.findById(id);

    if (!table) {
      console.log("Table not found.");
      return res.status(404).json({ message: "Table not found." });
    }

    // Check if the user is the owner of the table
    if (table.createdBy.toString() !== userId) {
      console.log("Unauthorized deletion attempt.");
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this table." });
    }

    // Delete the single table
    await table.deleteOne();
    return res.status(200).json({ message: "Table deleted successfully." });
  } catch (error) {
    console.error("Error deleting table(s):", error.message);
    res
      .status(500)
      .json({ errorMessage: "Server error. Please try again later." });
  }
};

const deleteSection = async (req, res) => {
  try {
    const { id } = req.params; // This can be either `id` or `tableSectionId`.

    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }
    // Assume it's a `tableSectionId`, find all matching tables
    tables = await AddTable.find({ tableSectionId: id });

    if (!tables || tables.length === 0) {
      console.log("No tables found for the given tableSectionId.");
      return res
        .status(404)
        .json({ message: "No tables found for the given section." });
    }

    // Check if the user is the owner of all the tables
    const unauthorizedTables = tables.filter(
      (table) => table.createdBy.toString() !== userId
    );

    if (unauthorizedTables.length > 0) {
      console.log("Unauthorized deletion attempt.");
      return res
        .status(403)
        .json({
          message: "You are not authorized to delete some of these tables.",
        });
    }

    // Delete all tables with the given tableSectionId
    await AddTable.deleteMany({ tableSectionId: id });
    res.status(200).json({
      message: `All tables with section ID ${id} deleted successfully.`,
    });
  } catch (error) {}
};

const updateTable = async (req, res) => {
  try {
    const { id } = req.params; // Extract table ID from URL params
    const { tableId } = req.body; // Extract updated table name from request body

    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // Validate input
    if (!tableId?.trim()) {
      return res.status(400).json({ message: "Table name cannot be empty." });
    }

    // Find the table by ID
    const table = await AddTable.findById(id);
    if (!table) {
      console.log("Table not found.");
      return res.status(404).json({ message: "Table not found." });
    }

    // Check if the user is the owner of the table
    if (table.createdBy.toString() !== userId) {
      console.log("Unauthorized update attempt.");
      return res
        .status(403)
        .json({ message: "You are not authorized to update this table." });
    }

    // Update the table name
    table.tableId = tableId;
    await table.save();

    res.status(200).json({ message: "Table updated successfully.", table });
  } catch (error) {
    console.error("Error updating table:", error.message);
    res
      .status(500)
      .json({ errorMessage: "Server error. Please try again later." });
  }
};

const regenerateQRCode = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // Find the table
    const table = await AddTable.findById(id);
    if (!table) {
      return res.status(404).json({ message: "Table not found." });
    }

    // Check if the user is the owner
    if (table.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to regenerate QR for this table." });
    }

    // Generate new QR code data with new token - Point to welcome page
    const token = crypto.randomBytes(16).toString("hex");
    const baseUrl = "https://beta--tableno21.netlify.app/";
    const qrCodeData = `${baseUrl}/customer/welcome/${table._id}?token=${token}`;

    // Update table
    table.qrCodeData = qrCodeData;
    await table.save();

    res.status(200).json({ 
      message: "QR Code regenerated successfully", 
      table,
      qrCodeData 
    });
  } catch (error) {
    console.error("Error regenerating QR code:", error.message);
    res.status(500).json({ errorMessage: "Server error. Please try again later." });
  }
};

module.exports = { addTableinDB, getAllTable, deleteTable, deleteSection, updateTable, regenerateQRCode };
