const menuItem = require("../../Model/Dashboard/menuItemModel.js");

const create = async (req, res) => {
  try {
    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { categoryId, items } = req.body;

    // Validate the request body
    if (!categoryId || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Iterate through the items to check if any item already exists
    for (const item of items) {
      const itemExist = await menuItem.findOne({
        categoryId,
        name: item.name,
        price: item.price,
        createdBy: userId,
      });
      if (itemExist) {
        return res.status(400).json({
          message: `Item "${item.name}" already exists in this category.`,
        });
      }
    }

    // If no duplicates, create and save the items
    const newItems = items.map((item) => ({
      categoryId,
      createdBy: userId,
      name: item.name,
      price: item.price,
      qty: item.qty ?? 0, // ✅ default to 0 if not provided
    }));

    const result = await menuItem.insertMany(newItems);

    res.status(200).json({ message: "Items created successfully", result });
    console.log(result);
  } catch (error) {
    res.status(500).json({ errormessage: error.message });
  }
};

const getAllItems = async (req, res) => {
  try {
    const { id: userId, adminId } = req.user;
    const creatorId = adminId || userId; // If waiter, use adminId. If admin, use their own ID.

    const itemData = await menuItem
      .find({ createdBy: creatorId })
      .populate("categoryId");

    if (itemData.length === 0) {
      return res.status(404).json({ message: "No items found." });
    }

    res.status(200).json(itemData);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ errorMessage: "Internal server error." });
  }
};

const getItemById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const id = req.params.id;

    const item = await menuItem
      .findOne({ _id: id, createdBy: userId })
      .populate("categoryId");

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or access denied." });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

const update = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const id = req.params.id;

    const item = await menuItem.findOne({ _id: id, createdBy: userId });
    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or access denied." });
    }

    // ✅ Only allow updating allowed fields
    const { name, price, qty, categoryId, available } = req.body;

    const updatedData = await menuItem.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(price !== undefined && { price }),
        ...(qty !== undefined && { qty }), // ✅ qty update support
        ...(categoryId && { categoryId }),
        ...(available !== undefined && { available }),
      },
      { new: true }
    );

    res.status(200).json({
      message: "Item updated successfully!",
      updatedItem: updatedData,
    });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

const updateSwitch = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const { id } = req.params;
    const { available } = req.body;

    if (typeof available !== "boolean") {
      return res.status(400).json({
        message: "Invalid input: 'available' must be a boolean value.",
      });
    }

    const item = await menuItem.findOne({ _id: id, createdBy: userId });
    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or you do not have access." });
    }

    item.available = available;
    await item.save();

    return res.status(200).json({
      message: `Item availability successfully updated to ${available}.`,
      updatedItem: item,
    });
  } catch (error) {
    console.error("Error updating switch:", error);
    return res
      .status(500)
      .json({ errorMessage: "An error occurred while updating the item." });
  }
};

const deleteItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const id = req.params.id;

    const item = await menuItem.findOne({ _id: id, createdBy: userId });
    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or access denied!" });
    }

    await menuItem.findByIdAndDelete(id);

    res.status(200).json({ message: "Item deleted successfully!" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

// Public endpoint for customer menu (no authentication required)
const getAllItemsPublic = async (req, res) => {
  try {
    // Get all available menu items from all restaurants
    const itemData = await menuItem
      .find({ available: true }) // Only show available items
      .populate("categoryId", "categoryName") // Populate category with name
      .select("-createdBy -__v") // Hide sensitive fields
      .lean(); // Convert to plain JavaScript object for better performance

    res.status(200).json(itemData);
  } catch (error) {
    console.error("Error fetching public items:", error);
    res.status(500).json({ errorMessage: "Internal server error." });
  }
};

module.exports = {
  create,
  getAllItems,
  getAllItemsPublic,
  getItemById,
  update,
  updateSwitch,
  deleteItem,
};
