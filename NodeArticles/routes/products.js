const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");

const db = dbSingleton.getConnection();

router.get("/", (req, res) => {
  const query = "SELECT * FROM products";

  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { size, quantity, price, color, category_id, description } = req.body;
  const query =
    "INSERT INTO users (size, quantity, price, color, category_id, description) VALUES (?, ?, ?, ?, ?, ?);";

  db.query(
    query,
    [size, quantity, price, color, category_id, description],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.json({ message: "User added!", id: results.insertId });
    }
  );
});

router.put("/:id", (req, res) => {
  const { id } = req.params;

  const { size, quantity, price, color, category_id, description } = req.body;

  const query =
    "UPDATE users SET size = ?, quantity = ?, price = ?, color = ?, category_id = ?, description = ? WHERE id = ?";

  db.query(
    query,
    [id, size, quantity, price, color, category_id, description],
    (err, results) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      res.json({ message: "product updated!" });
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM products WHERE product_id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: "product deleted!" });
  });
});

module.exports = router;
