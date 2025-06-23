const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");

const db = dbSingleton.getConnection();

// Get cart items by email
router.get("/:email", (req, res) => {
  const { email } = req.params;
  const query = "SELECT * FROM cart WHERE user_email = ?";

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error fetching cart:", err);
      return res.status(500).json({ error: "Failed to fetch cart items" });
    }
    res.json(results);
  });
});

// Add product to cart (upsert logic)
router.post("/addToCart", (req, res) => {
  const { email, product_id, quantity } = req.body;

  if (!email || !product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ error: "Missing or invalid fields" });
  }

  const query = `
    INSERT INTO cart (user_email, product_id, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
  `;

  db.query(query, [email, product_id, quantity], (err, results) => {
    if (err) {
      console.error("Error adding to cart:", err);
      return res.status(500).json({ error: "Failed to add product to cart" });
    }

    res.json({ message: "Product added to cart!", id: results.insertId });
  });
});

// Update cart item quantity
router.put("/:email/:product_id", (req, res) => {
  const { email, product_id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: "Invalid quantity" });
  }

  const query =
    "UPDATE cart SET quantity = ? WHERE user_email = ? AND product_id = ?";

  db.query(query, [quantity, email, product_id], (err, results) => {
    if (err) {
      console.error("Error updating cart item:", err);
      return res.status(500).json({ error: "Failed to update cart item" });
    }

    res.json({ message: "Product updated in cart!" });
  });
});

// Delete cart item
router.delete("/:email/:product_id", (req, res) => {
  const { email, product_id } = req.params;

  const query = "DELETE FROM cart WHERE user_email = ? AND product_id = ?";

  db.query(query, [email, product_id], (err, results) => {
    if (err) {
      console.error("Error deleting from cart:", err);
      return res
        .status(500)
        .json({ error: "Failed to delete product from cart" });
    }

    res.json({ message: "Product deleted from cart!" });
  });
});

module.exports = router;
