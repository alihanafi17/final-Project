// const express = require("express");
// const router = express.Router();
// const dbSingleton = require("../dbSingleton");

// const db = dbSingleton.getConnection();

// router.get("/", (req, res) => {
//   const query = "SELECT * FROM orders";

//   db.query(query, (err, results) => {
//     if (err) {
//       res.status(500).send(err);
//       return;
//     }
//     res.json(results);
//   });
// });

// router.get("/orderId/:id", (req, res) => {
//   const { id } = req.params;

//   const query = "SELECT * FROM orders WHERE order_id = ?";

//   db.query(query, [id], (err, results) => {
//     if (err) {
//       res.status(500).send(err);
//       return;
//     }

//     res.json(results);
//   });
// });

// // *** THIS IS THE IMPORTANT ENDPOINT for detailed order info ***
// router.get("/:id/details", (req, res) => {
//   const { id } = req.params;

//   const query = `
//     SELECT
//       p.name AS product_name,
//       p.price AS unit_price,
//       oi.quantity,
//       oi.size,
//       oi.color,
//       (p.price * oi.quantity) AS subtotal
//     FROM orders oi
//     JOIN products p ON oi.product_id = p.id
//     WHERE oi.order_id = ?
//   `;

//   db.query(query, [id], (err, results) => {
//     if (err) {
//       console.error("Error fetching full order details:", err);
//       res.status(500).send("Error fetching full order details");
//       return;
//     }

//     res.json(results);
//   });
// });

// router.get("/:email", (req, res) => {
//   const { email } = req.params;

//   const query = "SELECT * FROM orders WHERE email = ?";

//   db.query(query, [email], (err, results) => {
//     if (err) {
//       res.status(500).send(err);
//       return;
//     }

//     res.json(results);
//   });
// });

// router.post("/", (req, res) => {
//   const { email, total_amount, order_date, order_time } = req.body;

//   const query =
//     "INSERT INTO orders (email, total_amount, order_date, order_time) VALUES (?, ?, ?, ?)";

//   db.query(
//     query,
//     [email, total_amount, order_date, order_time],
//     (err, results) => {
//       if (err) {
//         res.status(500).send(err);
//         return;
//       }

//       res.status(201).json({ message: "Order created successfully" });
//     }
//   );
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");

const db = dbSingleton.getConnection();

// Get all orders
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

// Get order by ID
router.get("/orderId/:id", (req, res) => {
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

// Get detailed order info including products
router.get("/:id/details", (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      p.product_id,
      p.name AS product_name,
      p.price AS unit_price,
      ocp.quantity,
      (p.price * ocp.quantity) AS subtotal
    FROM order_contains_product ocp
    JOIN products p ON ocp.product_id = p.product_id
    WHERE ocp.order_id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching full order details:", err);
      res.status(500).send("Error fetching full order details");
      return;
    }

    res.json(results);
  });
});

// Get orders by user email
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

// Create new order
router.post("/", (req, res) => {
  const { email, total_amount, order_date, order_time } = req.body;

  // Validate inputs types
  if (
    typeof email !== "string" ||
    typeof total_amount !== "number" ||
    typeof order_date !== "string" ||
    typeof order_time !== "string"
  ) {
    return res
      .status(400)
      .json({ error: "Invalid input types for order creation" });
  }

  const query =
    "INSERT INTO orders (email, total_amount, order_date, order_time) VALUES (?, ?, ?, ?)";

  db.query(
    query,
    [email, total_amount, order_date, order_time],
    (err, results) => {
      if (err) {
        console.error("Error creating order:", err);
        res.status(500).send(err);
        return;
      }

      res.status(201).json({
        message: "Order created successfully",
        orderId: results.insertId,
      });
    }
  );
});

// Add products to an order (order_contains_product)
router.post("/:orderId/products", (req, res) => {
  const { orderId } = req.params;
  const { products, email } = req.body;

  if (!Array.isArray(products) || products.length === 0 || !email) {
    return res
      .status(400)
      .json({ error: "Products array and email are required" });
  }

  const values = products.map(({ product_id, quantity }) => [
    orderId,
    product_id,
    quantity,
  ]);

  const insertQuery = `
    INSERT INTO order_contains_product (order_id, product_id, total_products)
    VALUES ?
    ON DUPLICATE KEY UPDATE total_products = VALUES(total_products)
  `;

  db.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error("Error adding products to order:", err);
      return res.status(500).send("Error adding products to order");
    }

    // Clear cart for the user after products added to order
    const deleteQuery = "DELETE FROM cart WHERE user_email = ?";
    db.query(deleteQuery, [email], (deleteErr) => {
      if (deleteErr) {
        console.error("Error clearing cart:", deleteErr);
        return res.status(500).send("Order added but failed to clear cart");
      }

      res
        .status(201)
        .json({ message: "Order and products processed. Cart cleared." });
    });
  });
});


module.exports = router;
