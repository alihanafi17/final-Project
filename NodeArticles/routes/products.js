const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = dbSingleton.getConnection();

// Multer config for storing images in /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// ✅ Get all products group by id
router.get("/", (req, res) => {
  const query = "SELECT * FROM products group by id";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ✅ Get all products
router.get("/adminView", (req, res) => {
  const query = "SELECT * FROM products";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ✅ Get product by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM products WHERE id=?";
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ✅ Get product by product_ID
router.get("/product-id/:product_id", (req, res) => {
  const { product_id } = req.params;
  const query = "SELECT * FROM products WHERE product_id=?";
  db.query(query, [product_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ✅ Serve product image by ID
router.get("/:id/image", (req, res) => {
  const { id } = req.params;
  const query = "SELECT image FROM products WHERE id = ? LIMIT 1";

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (!results.length || !results[0].image) {
      return res.status(404).json({ message: "Image not found" });
    }

    const imagePath = path.join(__dirname, "..", "uploads", results[0].image);
    fs.access(imagePath, fs.constants.F_OK, (fsErr) => {
      if (fsErr) return res.status(404).json({ message: "Image file missing" });
      res.sendFile(imagePath);
    });
  });
});

// ✅ Add new product (with image)
router.post("/", upload.single("image"), (req, res) => {
  const { id, size, color, name, description, category_id, price, quantity } =
    req.body;
  const image = req.file ? req.file.filename : null;

  const query = `
    INSERT INTO products (id, size, color, name, description, category_id, price, quantity, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    id,
    size,
    color,
    name,
    description,
    category_id,
    price,
    quantity,
    image,
  ];

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Product added!" });
  });
});

router.put("/:product_id", upload.single("image"), (req, res) => {
  const { product_id } = req.params;
  const { size, color, name, description, category_id, price, quantity } =
    req.body;

  const image = req.file ? req.file.filename : null;

  const query = image
    ? `
      UPDATE products
      SET size = ?, color = ?, name = ?, description = ?, category_id = ?, price = ?, quantity = ?, image = ?
      WHERE product_id = ?
    `
    : `
      UPDATE products
      SET size = ?, color = ?, name = ?, description = ?, category_id = ?, price = ?, quantity = ?
      WHERE product_id = ?
    `;

  const params = image
    ? [
        size,
        color,
        name,
        description,
        category_id,
        price,
        quantity,
        image,
        product_id,
      ]
    : [
        size,
        color,
        name,
        description,
        category_id,
        price,
        quantity,
        product_id,
      ];

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Product updated!" });
  });
});

// ✅ Bulk update product quantities (after orders)
router.post("/update-quantities", (req, res) => {
  const products = req.body.products;
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "Invalid product data." });
  }

  const updatePromises = products.map(({ product_id, quantity }) => {
    const query =
      "UPDATE products SET quantity = quantity - ? WHERE product_id = ?";
    return new Promise((resolve, reject) => {
      db.query(query, [quantity, product_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  });

  Promise.all(updatePromises)
    .then(() => res.json({ message: "Product quantities updated!" }))
    .catch((err) => {
      console.error("Failed to update product quantities:", err);
      res.status(500).send(err);
    });
});

// ✅ Delete a product
router.delete("/:product_id", (req, res) => {
  const { product_id } = req.params;
  const query = "DELETE FROM products WHERE product_id = ?";
  db.query(query, [product_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Product deleted!" });
  });
});

module.exports = router;
