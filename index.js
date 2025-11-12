const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const signupRoutes = require("./Routes/Signup.js");
const categoryRoutes = require("./Routes/Dashboard/menuCategoryRoute.js");
const itemRoutes = require("./Routes/Dashboard/menuItemRoute.js");
const kotRoutes = require("./Routes/Home/KotRoutes.js");
const orderStatusRoutes = require("./Routes/Orders/orderStatusRoute.js");
const tableSection = require("./Routes/Dashboard/tableSectionRoute.js");
const addTable = require("./Routes/Home/addTableRoutes.js");
const ordersRoute = require("./Routes/Dashboard/orderRoute.js");
const staff = require("./Routes/Dashboard/staff/staffRoute.js");
const orderStats = require("./Routes/Dashboard/dashBoardRoute.js");
const inventoryRoute = require("./Routes/Dashboard/inventoryRoute.js");
const customer = require("./Routes/CRM/customerRoutes.js");
const coupons = require("./Routes/CRM/couponRoutes.js");
const customerOrderRoutes = require("./Routes/Customer/customerOrderRoutes.js");
const customerKotRoutes = require("./Routes/Customer/customerKotRoutes.js");
const app = express();
app.use(bodyParser.json());
app.use(cors());
dotenv.config();

const PORT = process.env.PORT || 7000;
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log("DB connection Error: ", error));

app.use("/dashboard", categoryRoutes, itemRoutes, tableSection, ordersRoute, orderStats, inventoryRoute);
app.use("/dashboard/staff", staff);
app.use("/api/customers", customer);
app.use("/api/coupons", coupons);
app.use("/api", customerOrderRoutes); // Customer QR ordering routes
app.use("/api", customerKotRoutes); // Customer KOT routes (no auth)
app.use("/", signupRoutes, kotRoutes, addTable, orderStatusRoutes);
