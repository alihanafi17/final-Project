const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");

const db = dbSingleton.getConnection();

// Add products to an order (bulk insert/update quantities)
router.post("/:orderId", (req, res) => {
  const { orderId } = req.params;
  const { products } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: "Products array is required" });
  }

  const values = products.map(({ product_id, quantity }) => [
    product_id,
    orderId,
    quantity,
  ]);

  const query = `
    INSERT INTO order_contains_product (product_id, order_id, total_products)
    VALUES ?
    ON DUPLICATE KEY UPDATE total_products = VALUES(total_products)
  `;

  db.query(query, [values], (err, result) => {
    if (err) {
      console.error("Error adding products to order_contains_product:", err);
      return res.status(500).send("Error adding products to order");
    }

    res.status(201).json({ message: "Products added to order successfully" });
  });
});

// Get all products in a specific order
router.get("/order/:orderId", (req, res) => {
  const { orderId } = req.params;

  const query = `
    SELECT * FROM order_contains_product WHERE order_id = ?
  `;

  db.query(query, [orderId], (err, results) => {
    if (err) {
      console.error(
        "Error fetching products from order_contains_product:",
        err
      );
      return res.status(500).json({ error: "Error fetching products" });
    }

    res.json(results);
  });
});

module.exports = router;
