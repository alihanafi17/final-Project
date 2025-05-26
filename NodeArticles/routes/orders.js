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
router.get("/:email", (req, res) => {
  const { email } = req.params;

  const query = "SELECT * FROM orders WHERE email = ?";

  db.query(query, [email], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    res.json(results);
  });
});

router.post("/", (req, res) => {
  const { total_amount, email, status } = req.body;
  const query =
    "INSERT INTO orders (total_amount ,email,status) VALUES ( ?, ?,?)";

  db.query(query, [total_amount, email, status], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: "order added!", id: results.insertId });
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const query = "UPDATE orders SET status = ? WHERE order_id = ?";

  db.query(query, [status, id], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    res.json({ message: "Order updated!" });
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
