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
    console.log("req.user:", req.user);

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
    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const id = req.params.id;

    // Check if the item exists and belongs to the authenticated user
    const item = await menuItem
      .findOne({ _id: id, createdBy: userId }) // Correct query
      .populate("categoryId"); // Populate category details

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or access denied." });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    res.status(500).json({ errorMessage: error.message }); // Fixed typo in error key
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

    // Check if the item exists and belongs to the authenticated user
    const item = await menuItem
      .findOne({ _id: id, createdBy: userId })
      .populate("categoryId");
    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or access denied." });
    }

    // Update the item
    const updatedData = await menuItem.findByIdAndUpdate(id, req.body, {
      new: true,
    });

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
    // Ensure the user is authenticated
    const userId = req.user?.id; // Assuming middleware adds `req.user`
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const { id } = req.params; // Get item ID from the route parameter
    const { available } = req.body; // Get the `available` status from the request body

    // Validate the `available` field
    if (typeof available !== "boolean") {
      return res.status(400).json({
        message: "Invalid input: 'available' must be a boolean value.",
      });
    }

    // Check if the item exists and belongs to the authenticated user
    const item = await menuItem.findOne({ _id: id, createdBy: userId });
    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or you do not have access." });
    }

    // Update the item's `available` status
    item.available = available;
    await item.save();

    // Respond with success
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
    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const id = req.params.id;

    // Check if the item exists and belongs to the authenticated user
    const item = await menuItem.findOne({ _id: id, createdBy: userId });
    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found or access denied!" });
    }

    // Delete the item
    await menuItem.findByIdAndDelete(id);

    res.status(200).json({ message: "Item deleted successfully!" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ errorMessage: error.message }); // Fixed typo in "errorMessage"
  }
};

module.exports = {
  create,
  getAllItems,
  getItemById,
  update,
  updateSwitch,
  deleteItem,
};
