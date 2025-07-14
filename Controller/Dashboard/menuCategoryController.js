const menuCategory = require("../../Model/Dashboard/menuCategoryModel.js");
const menuItem = require("../../Model/Dashboard/menuItemModel.js");

const create = async (req, res) => {
  try {
    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
 
    // Validate request body
    const { categoryName} = req.body;
    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Check if category already exists
    const categoryExists = await menuCategory.findOne({ categoryName, createdBy: userId });
    if (categoryExists) {
      return res.status(409).json({ message: "Category already exists" });
    }

    // Create a new category
    const newCategory = new menuCategory({categoryName,  createdBy: userId} );
    await newCategory.save();

    return res.status(201).json({ message: "Category created successfully!" });
  } catch (error) {
    console.error("Error creating category:", error.message);

    // Return appropriate error response
    return res.status(500).json({
      message: "Internal server error. Please try again later.",
      error: error.message,
    });
  }
};

const getCategory = async (req, res) => {
  try {
      // Ensure the user is authenticated
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required." });
      }
    const categoryData = await menuCategory.find({ createdBy: userId });
    if (!categoryData || categoryData.length === 0) {
      return res.status(404).json({ message: "No categories found!" });
    }
    res.status(200).json(categoryData);
  } catch (error) {
    res.status(500).json({ errormessage: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const id = req.params.id;

    // Check if the category exists and belongs to the authenticated user
    const category = await menuCategory.findOne({ _id: id, createdBy: userId });
    if (!category) {
      return res.status(404).json({ message: "Category not found or access denied!" });
    }

    // Delete all items related to this category
    await menuItem.deleteMany({ categoryId: id });

    // Delete the category
    await menuCategory.findByIdAndDelete(id);

    res.status(200).json({ message: "Category deleted successfully!" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};


const update = async (req, res) => {
  try {
    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const id = req.params.id;

    // Check if the category exists and belongs to the authenticated user
    const category = await menuCategory.findOne({ _id: id, createdBy: userId });
    if (!category) {
      return res.status(404).json({ message: "Category not found or access denied." });
    }

    // Update the category
    const updatedData = await menuCategory.findByIdAndUpdate(
      id,
      req.body,
      { new: true } // Returns the updated document
    );

    // Respond with success message
    res.status(200).json({
      message: "Category updated successfully!",
      updatedCategory: updatedData,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};


const getCategoryByID = async (req, res) => {
  try {
    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // Validate the ID parameter
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Category ID is required." });
    }

    // Query the database for the category
    const category = await menuCategory.findOne({ _id: id, createdBy: userId });
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Return the category
    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

module.exports = {
  create,
  getCategory,
  deleteCategory,
  update,
  getCategoryByID,
};
