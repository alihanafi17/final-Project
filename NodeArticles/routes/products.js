const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");

const db = dbSingleton.getConnection();

router.get("/", (req, res) => {
  const query = "SELECT * FROM products GROUP BY id";

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

router.get("/adminView", (req, res) => {
  const query = "SELECT * FROM products";

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
  const query = "SELECT * FROM products WHERE id=?";

  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { id, size, color, name, description, category_id, price, quantity } =
    req.body;
  const query =
    "INSERT INTO products (id, size, color, name, description, category_id, price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";

  db.query(
    query,
    [id, size, color, name, description, category_id, price, quantity],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.json({ message: "Product added!" });
    }
  );
});

router.put("/:product_id", (req, res) => {
  const { product_id } = req.params;

  const { size, color, name, description, category_id, price, quantity } =
    req.body;

  const query =
    "UPDATE products SET size = ?, color = ?, name = ?, description = ?, category_id = ?, price = ?, quantity = ? WHERE product_id = ?";

  db.query(
    query,
    [size, color, name, description, category_id, price, quantity, product_id],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      res.json({ message: "product updated!" });
    }
  );
});

router.delete("/:product_id", (req, res) => {
  const { product_id } = req.params;
  const query = "DELETE FROM products WHERE product_id = ?";

  db.query(query, [product_id], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: "product deleted!" });
  });
});

module.exports = router;
