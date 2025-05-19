const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");

const db = dbSingleton.getConnection();

router.get("/", (req, res) => {
  const query = "SELECT * FROM orders";

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

  const query = "SELECT * FROM orders WHERE order_id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { order_date, total_amount, email } = req.body;
  const query =
    "INSERT INTO users (order_date,total_amount ,email) VALUES (?, ?, ?)";

  db.query(query, [order_date, total_amount, email], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: "order added!", id: results.insertId });
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;

  const { order_date, total_amount, email } = req.body;

  const query =
    "UPDATE orders SET order_date=?, total_amount=?, email=? WHERE order_id=?";

  db.query(query, [id, order_date, total_amount, email], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    res.json({ message: "order updated!" });
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM orders WHERE order_id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: "order deleted!" });
  });
});

module.exports = router;
