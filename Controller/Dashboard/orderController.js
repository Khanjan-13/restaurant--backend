const Orders = require("../../Model/Dashboard/ordersModel");
const Kot = require("../../Model/Home/Kot.js");
const create = async (req, res) => {
  try {
    const { tokenNumber, items, totalAmount, paymentMethod, tableNumber } =
      req.body;
    const userId = req.user?.id;
    console.log("Request body received:", req.body);

    // Validate input
    if (
      !tokenNumber ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !paymentMethod ||
      !totalAmount
    ) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Validate each item in the items array
    for (const item of items) {
      if (
        !item.itemName ||
        typeof item.itemPrice !== "number" ||
        typeof item.itemQuantity !== "number"
      ) {
        return res.status(400).json({
          message:
            "Each item must have a valid name, price (number), and quantity (number).",
        });
      }
    }


    // Prepare and save the order
    const newOrder = new Orders({
      createdBy: userId,
      tokenNumber,
      items: items.map((item) => ({
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        itemQuantity: item.itemQuantity,
        itemCategory: item.itemCategory || "",
        itemDescription: item.itemDescription || "",
      })),
      totalAmount,
      paymentMethod,
      tableNumber: tableNumber,
    });

    const savedOrder = await newOrder.save();
    res
      .status(201)
      .json({ message: "Order saved successfully", order: savedOrder });
  } catch (error) {
    console.error("Error saving order:", error);
    res
      .status(500)
      .json({ message: "Failed to save order", error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // Fetch items created by the authenticated user
    const ordersData = await Orders.find().sort({ createdAt: -1 });

    // Check if no items are found
    if (ordersData.length === 0) {
      console.log("No items found.");
      return res.status(404).json({ message: "No items found" });
    }

    // Return items if found
    res.status(200).json(ordersData);
  } catch (error) {
    console.error("Error fetching items:", error);

    // Handle mongoose cast errors
    if (error instanceof mongoose.Error.CastError) {
      console.error("Cast error occurred:", error);
      return res.status(400).json({ errorMessage: "Invalid data format" });
    }

    // Generic server error
    res.status(500).json({ errorMessage: "Internal server error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    // Ensure the user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // Extract the order ID from the request parameters
    const { id } = req.params;

    // Validate the ID format (optional but recommended)
    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //   return res.status(400).json({ message: "Invalid order ID format." });
    // }

    // Fetch the specific order by ID
    const order = await Orders.findById(id);

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Ensure the order belongs to the authenticated user (if applicable)
    // if (order.userId.toString() !== userId) {
    //   return res.status(403).json({ message: "Access denied to this order." });
    // }

    // Return the order if found
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order by ID:", error);

    // Handle mongoose cast errors
    // if (error instanceof mongoose.Error.CastError) {
    //   return res.status(400).json({ errorMessage: "Invalid order ID." });
    // }

    // Generic server error
    res.status(500).json({ errorMessage: "Internal server error." });
  }
};

const saveOrderAndDeleteKot = async (req, res) => {
  try {
    const tableNumber = req.params.tableNumber; // passed from URL
    const { tokenNumber, paymentMethod } = req.body; // passed from frontend body

    console.log("Table:", tableNumber, "Token:", tokenNumber, "Payment:", paymentMethod);

    const { id: userId, adminId } = req.user;
    const creatorId = adminId || userId;

    // Step 1: Fetch all KOT items for that table
    const kotItems = await Kot.find({ tableNumber, createdBy: creatorId });

    if (!kotItems || kotItems.length === 0) {
      return res.status(404).json({
        message: `No KOT items found for table ${tableNumber}`,
      });
    }

    // Step 2: Prepare order data from KOT items
    const orderItems = kotItems.map((item) => ({
      itemName: item.itemName,
      itemPrice: item.itemPrice,
      itemQuantity: item.itemQuantity,
      itemCategory: item.itemCategory || "",
      itemDescription: item.itemDescription || "",
    }));

    // Calculate total amount
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.itemPrice * item.itemQuantity,
      0
    );

    // Step 3: Save new order with tokenNumber & paymentMethod
    const newOrder = new Orders({
      tokenNumber,     // from frontend body
      paymentMethod,   // from frontend body
      tableNumber,
      items: orderItems,
      totalAmount,
      createdBy: creatorId,
      orderStatus: true,
    });

    await newOrder.save();

    // Step 4: Delete all KOT items for that table
    await Kot.deleteMany({ tableNumber, createdBy: creatorId });

    // Step 5: Respond success
    return res.status(200).json({
      message: `Order saved and KOT items deleted for table ${tableNumber}`,
      order: newOrder,
    });
  } catch (error) {
    console.error("Error saving order and deleting KOT:", error);
    return res.status(500).json({
      message: "An error occurred while saving the order and deleting KOT",
      error: error.message,
    });
  }
};


module.exports = { create, getAllOrders, getOrderById, saveOrderAndDeleteKot };
