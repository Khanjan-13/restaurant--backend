const Kot = require("../../Model/Home/Kot.js");
const AddTable = require("../../Model/Home/addTableModel.js");
const MenuItem = require("../../Model/Dashboard/menuItemModel.js");

// Create KOT for customer order (no authentication required)
// Same logic as admin KOT but without auth middleware
const createCustomerKot = async (req, res) => {
  try {
    const { tableId, tokenNumber, items, totalAmount } = req.body;

    // Validation
    if (!tableId) {
      return res.status(400).json({ message: "Table ID is required" });
    }
    if (!tokenNumber) {
      return res.status(400).json({ message: "Token number is required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items must be a non-empty array" });
    }
    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    // Verify table exists and get table details
    const table = await AddTable.findById(tableId).populate('createdBy', '_id');
    
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const creatorId = table.createdBy._id; // Use restaurant owner's ID from table

    // Start MongoDB transaction for atomic operations
    const session = await Kot.startSession();
    session.startTransaction();

    try {
      const newItems = [];

      for (const item of items) {
        if (
          !item.itemName ||
          !item.itemPrice ||
          !item.itemQuantity ||
          typeof item.itemPrice !== "number" ||
          typeof item.itemQuantity !== "number"
        ) {
          throw new Error("Each item must have valid itemName, itemPrice, and itemQuantity");
        }

        // ✅ Find item in stock
        const menuItem = await MenuItem.findOne({ name: item.itemName }).session(session);

        if (!menuItem) {
          throw new Error(`Menu item '${item.itemName}' not found`);
        }

        if (menuItem.qty < item.itemQuantity) {
          throw new Error(
            `Not enough stock for ${item.itemName}. Available: ${menuItem.qty}`
          );
        }

        // ✅ Subtract quantity from stock
        menuItem.qty -= item.itemQuantity;
        if (menuItem.qty <= 0) {
          menuItem.available = false; // mark unavailable if out of stock
        }
        await menuItem.save({ session });

        // Prepare KOT entry
        newItems.push({
          createdBy: creatorId,
          tokenNumber,
          itemName: item.itemName,
          itemPrice: item.itemPrice,
          itemQuantity: item.itemQuantity,
          itemDescription: item.itemDescription || "",
          itemCategory: item.itemCategory || null,
          tableNumber: table.tableNumber,
          totalAmount,
          orderStatus: true, // Active KOT
          isKot: true,
        });
      }

      // ✅ Save KOT items
      const result = await Kot.insertMany(newItems, { session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({ 
        message: "KOT created successfully", 
        tokenNumber: tokenNumber,
        kotItems: result,
        tableNumber: table.tableNumber,
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (error) {
    console.error("Error creating customer KOT:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

module.exports = {
  createCustomerKot,
};
