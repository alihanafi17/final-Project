const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const usersRoutes = require("./routes/users");
const productsRoutes = require("./routes/products");
const categoriesRoutes = require("./routes/categories");
const ordersRoutes = require("./routes/orders");
const serviceRoutes = require("./routes/service");
const cartRoutes = require("./routes/cart");
const order_contain_productsRoutes = require("./routes/order_contain_products");

const app = express();
const port = 8801;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/users", usersRoutes);
app.use("/products", productsRoutes);
app.use("/categories", categoriesRoutes);
app.use("/orders", ordersRoutes);
app.use("/service", serviceRoutes);
app.use("/cart", cartRoutes);
app.use("/order_contain_product", order_contain_productsRoutes);
app.use("/uploads", express.static("uploads"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
