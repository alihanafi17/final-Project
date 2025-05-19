const express = require("express");
const cors = require("cors");
const app = express();

const usersRoutes = require("./routes/users");
const productsRoutes = require("./routes/products");
const categoriesRoutes = require("./routes/categories");
const ordersRoutes = require("./routes/orders");
const port = 8801;

// Enable CORS for all routes
app.use(
  cors({
    origin: "http://localhost:3000", // React app URL during development
    credentials: true,
  })
);

app.use(express.json());

app.use("/users", usersRoutes);
app.use("/products", productsRoutes);
app.use("/categories", categoriesRoutes);
app.use("/orders", ordersRoutes);
app.use((err, req, res, next) => {
  console.error(err); // Log error
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

console.log("aaaaa");
