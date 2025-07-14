const TableSection = require("../../Model/Dashboard/menuTableSectionModel.js");

const createTableSection = async (req, res) => {
  try {
    // Ensure the user is authenticated
    const userId = req.user?.id;
    console.log("User ID:", userId);
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { tableSection } = req.body;

    // Check if the table section already exists
    const tableSectionExist = await TableSection.findOne({ tableSection, createdBy:userId });
    if (tableSectionExist) {
      return res.status(400).json({ message: "Table Section already exists" });
    }

    // Create a new table section
    const newTableSection = new TableSection({
      tableSection,
      createdBy: userId,
    });

    // Save to database
    const result = await newTableSection.save();
    res.status(200).json({
      message: "Table Section created successfully.",
      tableSection: result,
    });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ errorMessage: error.message });
  }
};


const getAllTableSection = async (req, res) => {
  try {
    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Fetch table sections created by the authenticated user
    const tableSections = await TableSection.find({ createdBy: userId }).select("-__v");

    res.status(200).json(tableSections);
  } catch (error) {
    console.error("Error fetching table sections:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};


const deleteTable = async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters

  // Get user ID from the authenticated user (assumes req.user is populated by middleware)
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    // Find and delete the table section by ID
    const deletedSection = await TableSection.findByIdAndDelete(id);

    if (!deletedSection) {
      return res.status(404).json({
        success: false,
        message: "Table section not found",
      });
    }

    // Optionally, you could add logging to track who deleted the section
    console.log(`User with ID ${userId} deleted table section with ID ${id}`);

    // Send a success response
    res.status(200).json({
      success: true,
      message: "Table section deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting table section:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the table section",
      error: error.message,
    });
  }
};

const updateTableSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableSection } = req.body;

    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // // Validate the ID format
    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   return res.status(400).json({ message: "Invalid table section ID" });
    // }

    if (!tableSection || tableSection.trim() === "") {
      return res
        .status(400)
        .json({ message: "Table section name is required and cannot be empty" });
    }

    // Check if the section exists and is owned by the user
    const existingSection = await TableSection.findById(id);
    if (!existingSection) {
      return res.status(404).json({ message: "Table section not found" });
    }

    if (existingSection.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this section" });
    }

    // Update the table section
    const updatedSection = await TableSection.findByIdAndUpdate(
      id,
      { tableSection },
      { new: true } // Return the updated document
    );

    res.status(200).json({
      message: "Table section updated successfully",
      updatedSection,
    });
  } catch (error) {
    console.error("Error updating table section:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  createTableSection,
  getAllTableSection,
  deleteTable,
  updateTableSection,
};
