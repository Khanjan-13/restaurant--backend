const Orders = require("../../Model/Dashboard/ordersModel");

const getOrderStats = async (req, res) => {
  try {
    // get date of 1 month ago
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const stats = await Orders.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth } // filter orders created in last month
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
