const AddTable = require("../../Model/Home/addTableModel.js");
const Customer = require("../../Model/CRM/customer.js");
const Orders = require("../../Model/Dashboard/ordersModel.js");
const Kot = require("../../Model/Home/Kot.js");
const MenuItem = require("../../Model/Dashboard/menuItemModel.js");

// Simple in-memory OTP storage (use Redis in production)
const otpStorage = new Map();

// Get table info when QR is scanned
const getTableInfo = async (req, res) => {
  try {
    const { tableId } = req.params;

    const table = await AddTable.findById(tableId).populate("tableSectionId", "tableSection");

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    res.json({
      tableId: table._id,
      tableNumber: table.tableId,
      section: table.tableSectionId?.tableSection || "N/A",
      status: table.status,
    });
  } catch (error) {
    console.error("Error fetching table info:", error);
    res.status(500).json({ error: "Failed to fetch table information" });
  }
};

// Send OTP to customer's phone
const sendOTP = async (req, res) => {
  try {
    const { phoneNumber, tableId } = req.body;

    if (!phoneNumber || phoneNumber.length < 10) {
      return res.status(400).json({ error: "Valid phone number is required" });
    }

    // Verify table exists
    const table = await AddTable.findById(tableId);
    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 5 min expiry
    otpStorage.set(phoneNumber, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      tableId,
    });

    // TODO: Integrate SMS service (Twilio, MSG91, etc.)
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    // For development, send OTP in response (REMOVE IN PRODUCTION)
    res.json({
      message: "OTP sent successfully",
      otp: process.env.NODE_ENV === "development" ? otp : undefined, // Only in dev mode
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp, tableId, customerName } = req.body;

    // Allow default OTP 123456 for easy testing
    const isDefaultOTP = otp === "123456";
    
    if (!isDefaultOTP) {
      const storedData = otpStorage.get(phoneNumber);

      if (!storedData) {
        return res.status(400).json({ error: "OTP not found or expired" });
      }

      if (storedData.expiresAt < Date.now()) {
        otpStorage.delete(phoneNumber);
        return res.status(400).json({ error: "OTP expired" });
      }

      if (storedData.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }

      if (storedData.tableId !== tableId) {
        return res.status(400).json({ error: "Table ID mismatch" });
      }

      // OTP verified - clear it
      otpStorage.delete(phoneNumber);
    }

    // Check if customer exists
    let customer = await Customer.findOne({ phone: phoneNumber });

    // If customer doesn't exist, create new one
    if (!customer) {
      // Get the restaurant owner from table
      const table = await AddTable.findById(tableId).populate("createdBy");
      
      customer = new Customer({
        name: customerName || "Customer",
        phone: phoneNumber,
        status: "friend",
        totalVisits: 0,
        totalSpend: 0,
        createdBy: table.createdBy._id,
      });
      await customer.save();
    }

    // Update last interaction
    customer.lastInteraction = new Date();
    customer.totalVisits += 1;
    await customer.save();

    res.json({
      verified: true,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        discount: customer.discount,
        status: customer.status,
        totalVisits: customer.totalVisits,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ error: "Verification failed" });
  }
};

// Place order from customer via QR
const placeCustomerOrder = async (req, res) => {
  try {
    const { tableId, phoneNumber, items, notes } = req.body;

    // Verify table exists
    const table = await AddTable.findById(tableId).populate("createdBy");
    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    // Verify customer exists and phone matches
    const customer = await Customer.findOne({ phone: phoneNumber });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found. Please verify your phone first." });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    // Check stock availability and reduce quantities
    for (const item of items) {
      const menuItem = await MenuItem.findOne({ name: item.itemName });

      if (!menuItem) {
        return res.status(404).json({ 
          error: `Menu item '${item.itemName}' not found in inventory` 
        });
      }

      if (menuItem.qty < item.itemQuantity) {
        return res.status(400).json({
          error: `Not enough stock for ${item.itemName}. Available: ${menuItem.qty}, Requested: ${item.itemQuantity}`
        });
      }

      // Reduce quantity from stock
      menuItem.qty -= item.itemQuantity;
      if (menuItem.qty <= 0) {
        menuItem.available = false; // Mark unavailable if out of stock
      }
      await menuItem.save();
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => {
      return sum + item.itemPrice * item.itemQuantity;
    }, 0);

    // Apply customer discount if any
    const discountAmount = (totalAmount * customer.discount) / 100;
    const finalAmount = totalAmount - discountAmount;

    // Generate token number
    const lastOrder = await Orders.findOne().sort({ tokenNumber: -1 });
    const tokenNumber = lastOrder ? lastOrder.tokenNumber + 1 : 1;

    // Prepare order items
    const orderItems = items.map((item) => ({
      itemName: item.itemName,
      itemPrice: item.itemPrice,
      itemQuantity: item.itemQuantity,
      itemCategory: item.itemCategory || "",
      itemDescription: item.itemDescription || "",
    }));

    // Create order with the restaurant owner as creator (same as admin orders)
    const order = new Orders({
      createdBy: table.createdBy._id, // Use restaurant owner ID
      customerId: customer._id,
      tableId: table._id,
      tokenNumber,
      items: orderItems,
      totalAmount: finalAmount,
      tableNumber: table.tableId,
      orderType: "QR_ORDER",
      kotGenerated: true,
      kotGeneratedAt: new Date(),
      customerPhone: phoneNumber,
      paymentMethod: "PENDING", // Will be updated when payment is made
    });

    await order.save();

    // Create KOT entries for each item (same as admin flow)
    const kotEntries = items.map((item) => ({
      createdBy: table.createdBy._id,
      tokenNumber,
      itemName: item.itemName,
      itemPrice: item.itemPrice,
      itemQuantity: item.itemQuantity,
      itemDescription: item.itemDescription || "",
      itemCategory: item.itemCategory || "",
      tableNumber: table.tableId,
      totalAmount: finalAmount,
      orderStatus: true, // Active KOT (ready for kitchen)
      isKot: true,
    }));

    await Kot.insertMany(kotEntries);

    // Update customer total spend
    customer.totalSpend += finalAmount;
    await customer.save();

    // Update table status to occupied
    table.status = "OCCUPIED";
    await table.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: {
        orderId: order._id,
        tokenNumber: order.tokenNumber,
        totalAmount: finalAmount,
        discount: discountAmount,
        orderType: order.orderType,
        tableNumber: table.tableId,
      },
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Failed to place order" });
  }
};

// Get order status for customer
const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Orders.findById(orderId)
      .populate("tableId", "tableId")
      .populate("customerId", "name phone");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      orderId: order._id,
      tokenNumber: order.tokenNumber,
      orderType: order.orderType,
      items: order.items,
      totalAmount: order.totalAmount,
      tableNumber: order.tableNumber,
      createdAt: order.createdAt,
      customer: order.customerId
        ? {
            name: order.customerId.name,
            phone: order.customerId.phone,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching order status:", error);
    res.status(500).json({ error: "Failed to fetch order status" });
  }
};

// Get customer's orders by phone
const getCustomerOrders = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    const customer = await Customer.findOne({ phone: phoneNumber });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const orders = await Orders.find({ customerId: customer._id })
      .populate("tableId", "tableId")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      customer: {
        name: customer.name,
        phone: customer.phone,
        totalVisits: customer.totalVisits,
        totalSpend: customer.totalSpend,
        discount: customer.discount,
        status: customer.status,
      },
      orders: orders.map((order) => ({
        orderId: order._id,
        tokenNumber: order.tokenNumber,
        orderType: order.orderType,
        totalAmount: order.totalAmount,
        tableNumber: order.tableNumber,
        createdAt: order.createdAt,
        items: order.items,
      })),
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

module.exports = {
  getTableInfo,
  sendOTP,
  verifyOTP,
  placeCustomerOrder,
  getOrderStatus,
  getCustomerOrders,
};
