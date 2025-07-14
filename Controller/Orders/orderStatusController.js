const orderStatus = require("../../Model/Home/Kot.js");

const fetchOrderItem = async (req, res) => {
  const tableNumber  = req.params.id; // Extract tableNumber from path parameters
  try {
    // Ensure the user is authenticated
    // const userId = req.user?.id;
    // if (!userId) {
    //   return res.status(401).json({ message: "Authentication required." });
    // }
     const { id: userId, adminId } = req.user;
    console.log("req.user:", req.user);

    const creatorId = adminId || userId; // If waiter, use adminId. If admin, use their own ID.

    const orders = await orderStatus.find({
      createdBy: creatorId,
      tableNumber: tableNumber,
      orderStatus: true, // Only fetch orders with orderStatus true
    });

    // if (orders.length === 0) {
    //   return res.status(404).json({ message: "No orders found for this table." });
    // }
    if (orders.length === 0) {
      // Return an empty array with a success message
      return res.status(200).json({
        message: "No active orders found for this table.",

      });
    }
    res.json(orders); // Return the orders
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

module.exports = { fetchOrderItem };

