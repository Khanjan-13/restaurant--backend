const Orders = require("../../Model/Dashboard/ordersModel");

const getOrderStats = async (req, res) => {
  try {
    // ✅ Ensure the user is authenticated
    const userId = req.user?.id;
    console.log("User ID:", userId);
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // ✅ Aggregate stats for orders created by this user
    const stats = await Orders.aggregate([
      {
        $match: {
          createdBy: userId  // 👈 check if order was created by this user
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" }
        }
      }
    ]);

    // ✅ If no orders found, return defaults
    if (!stats.length) {
      return res.status(200).json({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0
      });
    }

    const { totalRevenue, totalOrders, averageOrderValue } = stats[0];

    res.status(200).json({
      totalRevenue,
      totalOrders,
      averageOrderValue
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};



module.exports = { getOrderStats };
