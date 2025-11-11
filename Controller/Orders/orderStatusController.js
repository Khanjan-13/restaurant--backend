const Kot = require("../../Model/Home/Kot.js");
const Orders = require("../../Model/Dashboard/ordersModel.js");
const AddTable = require("../../Model/Home/addTableModel.js");

const fetchOrderItem = async (req, res) => {
  const tableIdentifier = req.params.id; // Can be table number like "G1" or tableId
  try {
    const { id: userId, adminId } = req.user;
    console.log("req.user:", req.user);

    const creatorId = adminId || userId; // If waiter, use adminId. If admin, use their own ID.

    // First, try to find the table to get both tableNumber and tableId
    let tableNumber = tableIdentifier;
    let tableId = null;

    // Check if the identifier is a valid ObjectId (tableId)
    if (tableIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
      const table = await AddTable.findById(tableIdentifier);
      if (table) {
        tableNumber = table.tableNumber;
        tableId = tableIdentifier;
      }
    } else {
      // It's a table number, try to find the table
      const table = await AddTable.findOne({ tableNumber: tableIdentifier });
      if (table) {
        tableId = table._id.toString();
        tableNumber = table.tableNumber;
      }
    }

    // Fetch KOT items (pending/active orders in kitchen)
    const kotItems = await Kot.find({
      createdBy: creatorId,
      tableNumber: tableNumber,
      orderStatus: true, // Active KOT items
    });

    // Fetch completed Orders for this table
    let completedOrders = [];
    
    // Try to fetch by tableId first (for QR orders and new orders)
    if (tableId) {
      completedOrders = await Orders.find({
        tableId: tableId,
        createdBy: creatorId,
      }).sort({ createdAt: -1 });
    }
    
    // Also fetch by tableNumber (for legacy orders)
    const ordersByTableNumber = await Orders.find({
      tableNumber: tableNumber,
      createdBy: creatorId,
    }).sort({ createdAt: -1 });
    
    // Merge and deduplicate orders
    const allOrders = [...completedOrders, ...ordersByTableNumber];
    const uniqueOrders = Array.from(
      new Map(allOrders.map(order => [order._id.toString(), order])).values()
    );

    // Return both KOT items and completed orders
    const response = {
      tableNumber: tableNumber,
      tableId: tableId,
      kotItems: kotItems,
      completedOrders: uniqueOrders,
      // For backward compatibility, also return as flat array
      items: kotItems, // This maintains compatibility with existing code
    };

    if (kotItems.length === 0 && uniqueOrders.length === 0) {
      return res.status(200).json({
        message: "No orders found for this table.",
        ...response,
      });
    }

    res.json(response);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders", details: error.message });
  }
};

module.exports = { fetchOrderItem };

