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

  const checkQuery = "SELECT * FROM categories WHERE category_id = ?";
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }

    const deleteQuery = "DELETE FROM categories WHERE category_id = ?";
    db.query(deleteQuery, [id], (err, results) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.json({ message: "Category deleted!" });
    });
  });
});

module.exports = router;
