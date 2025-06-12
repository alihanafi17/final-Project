const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");

const db = dbSingleton.getConnection();

router.get("/", (req, res) => {
  const query = "SELECT * FROM categories";

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM categories WHERE category_id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { name, number } = req.body;

  const checkQuery = "SELECT * FROM categories WHERE category_id = ?";
  db.query(checkQuery, [number], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Category ID already exists." });
    }

    const insertQuery =
      "INSERT INTO categories (category_name, category_id) VALUES (?, ?)";
    db.query(insertQuery, [name, number], (err, results) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.json({ message: "Category added!", id: results.insertId });
    });
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  // First check if the category exists
  const checkQuery = "SELECT * FROM categories WHERE category_id = ?";
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error("Error checking category:", err);
      res.status(500).json({ message: "Server error while checking category" });
      return;
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }

    // First delete all products in this category
    const deleteProductsQuery = "DELETE FROM products WHERE category_id = ?";
    db.query(deleteProductsQuery, [id], (err, productResults) => {
      if (err) {
        console.error("Error deleting products:", err);
        res.status(500).json({ message: "Server error while deleting products" });
        return;
      }
      
      // Now that products are deleted, delete the category
      const deleteQuery = "DELETE FROM categories WHERE category_id = ?";
      db.query(deleteQuery, [id], (err, results) => {
        if (err) {
          console.error("Error deleting category:", err);
          res.status(500).json({ message: "Server error while deleting category" });
          return;
        }
        res.json({ message: "Category and all its products deleted!" });
      });
    });
  });
});

module.exports = router;
