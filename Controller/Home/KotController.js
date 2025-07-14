const Kot = require("../../Model/Home/Kot.js");
const mongoose = require("mongoose");

const create = async (req, res) => {
  try {
    const { tokenNumber, items, totalAmount } = req.body;

    // Ensure the user is authenticated
    // const userId = req.user?.id;
    // if (!userId) {
    //   return res.status(401).json({ message: "Authentication required" });
    // }

    const { id: userId, adminId } = req.user;
    console.log("req.user:", req.user);

    const creatorId = adminId || userId; // If waiter, use adminId. If admin, use their own ID.

    // Validate the request body
    if (!tokenNumber) {
      return res.status(400).json({ message: "Token number is required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Items must be a non-empty array" });
    }
    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    // Map and prepare items to insert
    const newItems = items.map((item) => {
      if (
        !item.itemName ||
        !item.itemPrice ||
        !item.itemQuantity ||
        typeof item.itemPrice !== "number" ||
        typeof item.itemQuantity !== "number"
      ) {
        throw new Error(
          "Each item must have valid itemName, itemPrice, and itemQuantity"
        );
      }

      return {
        createdBy: creatorId, // Associate the item with the authenticated user
        tokenNumber, // Token number from the request body
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        itemQuantity: item.itemQuantity,
        itemDescription: item.itemDescription || "",
        itemCategory: item.itemCategory || null,
        tableNumber: item.tableNumber || null,
        totalAmount, // Total amount passed in request
        orderStatus: item.orderStatus || "pending", // Default to "pending" if not provided
      };
    });

    // Insert new items into the database
    const result = await Kot.insertMany(newItems);

    res.status(201).json({ message: "Items created successfully", result });
  } catch (error) {
    console.error("Error creating items:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

const getKot = async (req, res) => {
  try {
    // Ensure the user is authenticated
    const { id: userId, adminId } = req.user;
    console.log("req.user:", req.user);

    const creatorId = adminId || userId; // If waiter, use adminId. If admin, use their own ID.

    const tokenNumber = req.params.id; // Extract tokenNumber from URL params

    console.log(`Fetching items with tokenNumber: ${tokenNumber}`);

    // Find items with the specified tokenNumber
    const itemData = await Kot.find({
      tokenNumber: tokenNumber,
      createdBy: creatorId,
    }); // Corrected query

    if (!itemData || itemData.length === 0) {
      console.log("No items found for this tokenNumber.");
      return res
        .status(404)
        .json({ message: "No items found for this tokenNumber" });
    }

    res.status(200).json(itemData);
  } catch (error) {
    res.status(500).json({ errormessage: error.message });
  }
};

const getAllKot = async (req, res) => {
  try {
    // Ensure the user is authenticated
    const { id: userId, adminId } = req.user;
    console.log("req.user:", req.user);

    const creatorId = adminId || userId; // If waiter, use adminId. If admin, use their own ID.

    console.log("User ID:", userId);

    const itemData = await Kot.find({ createdBy: creatorId }); // Find all items in the collection
    res.status(200).json(itemData);
    console.log(itemData);
  } catch (error) {
    res.status(500).json({ errormessage: error.message });
  }
};

const getLatestKot = async (req, res) => {
  try {
    // Ensure the user is authenticated
    const { id: userId, adminId } = req.user;
    console.log("req.user:", req.user);

    const creatorId = adminId || userId; // If waiter, use adminId. If admin, use their own ID.

    console.log("User ID:", userId);

    // Fetch the latest KOT specific to the authenticated user by sorting in descending order of tokenNumber
    const latestKot = await Kot.findOne({ createdBy: creatorId }).sort({
      tokenNumber: -1,
    });

    // Respond with the latest token number or 0 if no tokens exist
    res.status(200).json({ latestToken: latestKot?.tokenNumber || 0 });
  } catch (error) {
    console.error("Error fetching latest token:", error);
    res.status(500).json({ errorMessage: "Failed to fetch the latest token" });
  }
};

const getKotByTableNumber = async (req, res) => {
  try {
    const { id: userId, adminId } = req.user;
    console.log("req.user:", req.user);

    const creatorId = adminId || userId; // If waiter, use adminId. If admin, use their own ID.

    const { tableNumber } = req.params;

    if (!tableNumber) {
      return res.status(400).json({ message: "Table number is required" });
    }

    console.log("Table Number:", tableNumber);

    // Fetch all KOT records for the specified table number
    const kotRecords = await Kot.find({ tableNumber });

    if (!kotRecords || kotRecords.length === 0) {
      return res
        .status(404)
        .json({ message: "No KOT found for the specified table" });
    }

    // Aggregate all items into a single array
    const aggregatedItems = kotRecords.map((record) => ({
      itemName: record.itemName,
      itemPrice: record.itemPrice,
      itemQuantity: record.itemQuantity,
      itemDescription: record.itemDescription,
      itemCategory: record.itemCategory,
      totalAmount: record.totalAmount,
      orderStatus: record.orderStatus,
    }));

    res.status(200).json({
      success: true,
      tableNumber,
      aggregatedItems,
    });
  } catch (error) {
    console.error("Error fetching KOT by table number:", error);
    res
      .status(500)
      .json({ errorMessage: "Failed to fetch KOT by table number" });
  }
};

const updateKot = async (req, res) => {
  try {
    const { id: userId, adminId } = req.user;
    console.log("req.user:", req.user);

    const creatorId = adminId || userId; // If waiter, use adminId. If admin, use their own ID.

    console.log("Authenticated User ID:", userId);

    const { tableNumber, orderStatus } = req.body;

    // Validate input
    // if (!tableNumber) {
    //   return res
    //     .status(400)
    //     .json({ message: "Invalid input: 'tableNumber' is required and must be a number." });
    // }
    // if (!orderStatus || typeof orderStatus !== "string") {
    //   return res
    //     .status(400)
    //     .json({ message: "Invalid input: 'orderStatus' is required and must be a string." });
    // }

    // Find and update the orders for the specific table and user
    const updatedOrder = await Kot.updateMany(
      { tableNumber, createdBy: creatorId }, // Match orders for the given table and user
      { $set: { orderStatus } } // Update the orderStatus
    );

    // Check if any orders were matched and updated
    if (updatedOrder.matchedCount === 0) {
      return res
        .status(404)
        .json({ message: `No orders found for table number ${tableNumber}.` });
    }

    // Respond with success
    return res.status(200).json({
      message: "Order status updated successfully!",
      matchedCount: updatedOrder.matchedCount,
      modifiedCount: updatedOrder.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating the order status:", error);
    return res.status(500).json({
      message: "An error occurred while updating the order status.",
      error: error.message,
    });
  }
};

const deleteKot = async (req, res) => {
  try {
    const { id: userId, adminId } = req.user;
    const creatorId = adminId || userId;
    const { tableNumber } = req.body;

    if (
      !tableNumber ||
      (typeof tableNumber !== "string" && typeof tableNumber !== "number")
    ) {
      return res.status(400).json({
        message: "'tableNumber' is required and must be a string or number.",
      });
    }

    // Step 1: Get all items for this table and creator
    const itemsToDelete = await Kot.find({ tableNumber, createdBy: creatorId });

    if (!itemsToDelete || itemsToDelete.length === 0) {
      return res.status(404).json({
        message: `No KOT items found for table number ${tableNumber}.`,
      });
    }

    // Step 2: Calculate total amount to subtract
    const deletedGroupTotal = itemsToDelete.reduce((total, item) => {
      return total + (item.totalAmount ?? item.itemPrice * item.itemQuantity);
    }, 0);

    // Step 3: Get all token groups remaining on this table (excluding those being deleted)
    const tokenTotals = await Kot.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(creatorId),
          tableNumber,
          _id: { $nin: itemsToDelete.map((i) => i._id) },
        },
      },
      {
        $group: {
          _id: "$tokenNumber",
          groupTotalAmount: {
            $sum: {
              $ifNull: [
                "$totalAmount",
                { $multiply: ["$itemPrice", "$itemQuantity"] },
              ],
            },
          },
        },
      },
      { $sort: { groupTotalAmount: -1 } },
    ]);

    const highestKot = tokenTotals[0];

    // Step 4: Adjust the highest token group if found
    if (highestKot) {
      const itemsToUpdate = await Kot.find({
        tokenNumber: highestKot._id,
        createdBy: creatorId,
        tableNumber,
      });

      let remainingToSubtract = deletedGroupTotal;

      for (const item of itemsToUpdate) {
        const itemValue =
          item.totalAmount ?? item.itemPrice * item.itemQuantity;

        if (remainingToSubtract <= 0) break;

        if (itemValue >= remainingToSubtract) {
          item.totalAmount = itemValue - remainingToSubtract;
          remainingToSubtract = 0;
        } else {
          item.totalAmount = 0;
          remainingToSubtract -= itemValue;
        }

        await item.save();
      }
    }

    // Step 5: Delete all KOTs for this table
    const result = await Kot.deleteMany({ tableNumber, createdBy: creatorId });

    // Step 6: Return response
    return res.status(200).json({
      message: `All KOTs for table number ${tableNumber} deleted successfully.`,
      deletedCount: result.deletedCount,
      totalPriceSubtracted: deletedGroupTotal,
      highestKotTokenNumber: highestKot?._id || null,
    });
  } catch (error) {
    console.error("Error deleting KOT items by table number:", error);
    return res.status(500).json({
      message: "An error occurred while deleting the KOT items.",
      error: error.message,
    });
  }
};

const deleteSingleKot = async (req, res) => {
  try {
    const { id: userId, adminId } = req.user;
    const creatorId = adminId || userId;
    const { itemId } = req.body;

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        message: "'itemId' is required and must be a valid ObjectId.",
      });
    }

    // Step 1: Find the item
    const item = await Kot.findOne({ _id: itemId, createdBy: creatorId });

    if (!item) {
      return res.status(404).json({
        message: `No KOT item found with id ${itemId}.`,
      });
    }

    // Step 2: Get item details
    const itemTotalAmount = item.itemPrice * item.itemQuantity;
    const tableNumber = item.tableNumber;

    // Step 3: Find other items on the same table (excluding this one)
    const otherItems = await Kot.find({
      tableNumber,
      createdBy: creatorId,
      _id: { $ne: itemId },
    }).sort({
      totalAmount: -1,
      updatedAt: -1,
    });

    let remainingToSubtract = itemTotalAmount;
    let adjustedItems = [];

    for (const otherItem of otherItems) {
      if (remainingToSubtract <= 0) break;

      const otherItemValue =
        otherItem.totalAmount ?? otherItem.itemPrice * otherItem.itemQuantity;

      if (otherItemValue >= remainingToSubtract) {
        otherItem.totalAmount = otherItemValue - remainingToSubtract;
        await otherItem.save();

        adjustedItems.push({
          itemId: otherItem._id,
          subtracted: remainingToSubtract,
          newTotalAmount: otherItem.totalAmount,
        });

        remainingToSubtract = 0;
      } else {
        otherItem.totalAmount = 0;
        await otherItem.save();

        adjustedItems.push({
          itemId: otherItem._id,
          subtracted: otherItemValue,
          newTotalAmount: 0,
        });

        remainingToSubtract -= otherItemValue;
      }
    }

    if (remainingToSubtract > 0) {
      console.warn(
        `Could not fully subtract item total (${itemTotalAmount}). Remaining: ${remainingToSubtract}`
      );
    }

    // Step 4: Delete the item
    await Kot.deleteOne({ _id: itemId, createdBy: creatorId });

    // Step 5: Send response
    return res.status(200).json({
      message: `KOT item with id ${itemId} deleted successfully.`,
      totalPriceSubtracted: itemTotalAmount - remainingToSubtract,
      remainingNotSubtracted: remainingToSubtract > 0 ? remainingToSubtract : 0,
      adjustedKotItems: adjustedItems,
    });
  } catch (error) {
    console.error("Error deleting single KOT item:", error);
    return res.status(500).json({
      message: "An error occurred while deleting the KOT item.",
      error: error.message,
    });
  }
};

module.exports = {
  create,
  getKot,
  getAllKot,
  getLatestKot,
  getKotByTableNumber,
  updateKot,
  deleteKot,
  deleteSingleKot,
};
