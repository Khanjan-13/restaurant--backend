const MenuItem = require("../../Model/Dashboard/menuItemModel.js");
const Orders = require("../../Model/Dashboard/ordersModel.js");
const Category = require("../../Model/Dashboard/menuCategoryModel.js");

// Helper to get last N months labels
const getLastNMonths = (n) => {
  const res = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    res.push({ month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear() });
  }
  return res;
};

const getInventoryAnalysis = async (req, res) => {
  try {
    const { id: userId, adminId } = req.user || {};
    const creatorId = adminId || userId;

    // Fetch menu items for this creator
    const items = await MenuItem.find({ createdBy: creatorId }).populate('categoryId');

    // Category distribution
    const categoryMap = {};
    items.forEach((it) => {
      const cat = it.categoryId?.categoryName || 'Uncategorized';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryDistribution = Object.keys(categoryMap).map((k, idx) => ({ name: k, value: categoryMap[k], color: ['#10B981','#EF4444','#F59E0B','#8B5CF6','#06B6D4','#6B7280'][idx % 6] }));

    // Top consumed items — aggregate from Orders for last 90 days
    const topConsumedAgg = await Orders.aggregate([
      { $match: { 
        createdBy: creatorId,
        createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90) } 
      } },
      { $unwind: '$items' },
      { $group: { _id: '$items.itemName', consumed: { $sum: '$items.itemQuantity' }, category: { $first: '$items.itemCategory' } } },
      { $sort: { consumed: -1 } },
      { $limit: 10 }
    ]);
    const topConsumedItems = topConsumedAgg.map((r) => ({ name: r._id, category: r.category || '—', consumed: r.consumed, remaining: (items.find(i=>i.name===r._id)?.qty) || 0, trend: 'up' }));

    // Low stock alerts (qty <= 10 or less)
    // Compute 30-day consumption per item to estimate days left
    const thirtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    const consumption30 = await Orders.aggregate([
      { $match: { 
        createdBy: creatorId,
        createdAt: { $gte: thirtyDaysAgo } 
      } },
      { $unwind: '$items' },
      { $group: { _id: '$items.itemName', consumed30: { $sum: '$items.itemQuantity' } } }
    ]);
    const consMap = {};
    consumption30.forEach(c=> consMap[c._id]=c.consumed30);

    const lowStockAlerts = items
      .filter(i => (typeof i.qty === 'number' ? i.qty <= 10 : false))
      .slice(0, 10)
      .map(i => {
        const consumed30 = consMap[i.name] || 0;
        const avgPerDay = consumed30 / 30;
        const daysLeft = avgPerDay > 0 ? Math.floor(i.qty / avgPerDay) : null;
        return { name: i.name, category: i.categoryId?.categoryName || '—', currentStock: i.qty, minLevel: 10, daysLeft };
      });

    // Value analysis by category
    const catValueMap = {};
    items.forEach(i => {
      const cat = i.categoryId?.categoryName || 'Uncategorized';
      const val = (i.price || 0) * (i.qty || 0);
      if (!catValueMap[cat]) catValueMap[cat] = { totalValue: 0, totalCost: 0, items: 0 };
      catValueMap[cat].totalValue += val;
      catValueMap[cat].totalCost += (i.price || 0);
      catValueMap[cat].items += 1;
    });
    const valueAnalysis = Object.keys(catValueMap).map(k=>({ category: k, totalValue: Math.round(catValueMap[k].totalValue), avgCost: Math.round(catValueMap[k].totalCost / Math.max(1, catValueMap[k].items)), items: catValueMap[k].items }));

    // Stock trends — monthly totals of items (from Orders) for last 6 months
    const months = getLastNMonths(6);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    const trendsAgg = await Orders.aggregate([
      { $match: { 
        createdBy: creatorId,
        createdAt: { $gte: sixMonthsAgo } 
      } },
      { $unwind: '$items' },
      { $group: { 
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, 
        totalItems: { $sum: '$items.itemQuantity' }
      } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Calculate low stock and out of stock for each month
    // Get month number from month name
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const stockTrends = months.map(m => {
      const monthIndex = monthNames.indexOf(m.month);
      const found = trendsAgg.find(t => {
        // MongoDB returns month as 1-12, so subtract 1 to match JavaScript's 0-11
        return t._id.month - 1 === monthIndex && t._id.year === m.year;
      });
      
      // Count low stock and out of stock items (current state, not historical)
      const lowStockCount = items.filter(i => (typeof i.qty === 'number' ? i.qty <= 10 && i.qty > 0 : false)).length;
      const outOfStockCount = items.filter(i => (typeof i.qty === 'number' ? i.qty === 0 : false)).length;
      
      return { 
        month: m.month, 
        totalItems: found ? found.totalItems : 0, 
        lowStock: lowStockCount, 
        outOfStock: outOfStockCount 
      };
    });

    // Recent activities — recent orders filtered by creator
    const recentOrders = await Orders.find({ createdBy: creatorId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const recentActivities = recentOrders.map(o => ({ 
      action: 'Order Placed', 
      item: o.items?.[0]?.itemName || '—', 
      quantity: o.items?.[0]?.itemQuantity || 0, 
      date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], 
      user: o.createdBy || 'Customer' 
    }));

    // Calculate summary statistics
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + (item.qty || 0), 0);
    const lowStockCount = items.filter(i => (typeof i.qty === 'number' ? i.qty <= 10 && i.qty > 0 : false)).length;
    const criticalStockCount = items.filter(i => (typeof i.qty === 'number' ? i.qty <= 1 : false)).length;
    const totalValue = items.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 0)), 0);
    const categoryCount = new Set(items.map(i => i.categoryId?.categoryName || 'Uncategorized')).size;

    return res.status(200).json({
      stockTrends,
      categoryDistribution,
      topConsumedItems,
      lowStockAlerts,
      valueAnalysis,
      recentActivities,
      summary: {
        totalItems,
        totalQuantity,
        lowStockCount,
        criticalStockCount,
        totalValue: Math.round(totalValue),
        categoryCount,
      },
    });
  } catch (error) {
    console.error('Inventory analysis error:', error);
    return res.status(500).json({ message: 'Failed to compute inventory analysis', error: error.message });
  }
};

module.exports = { getInventoryAnalysis };
