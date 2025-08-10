const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const db = dbSingleton.getConnection();
const nodemailer = require("nodemailer");

// Get all orders
router.get("/", (req, res) => {
  const query = "SELECT * FROM orders";
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ✅ Get only pending orders
router.get("/pending", (req, res) => {
  const query = "SELECT * FROM orders WHERE status = 'pending'";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching pending orders:", err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// ✅ Mark order as completed and send email
router.put("/:id/complete", async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Get the order info
    const [order] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM orders WHERE order_id = ?",
        [id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 2. Update status
    await new Promise((resolve, reject) => {
      db.query(
        "UPDATE orders SET status = 'Completed' WHERE order_id = ?",
        [id],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // 3. Send confirmation email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"NUVEL by Ali" <${process.env.EMAIL_USER}>`,
      to: order.email,
      subject: `Your Order #${order.order_id} is Completed and Shipped To You!`,
      text: `Hello,\n\nYour order #${order.order_id} has been completed. Thank you for shopping with us!\n\nBest regards,\nNUVEL by Ali`,
    });

    res.json({ message: "Order marked as completed and email sent" });
  } catch (err) {
    console.error("Error completing order:", err);
    res.status(500).json({ error: "Failed to complete order" });
  }
});

// Get order by ID (basic info only)
router.get("/orderId/:id", (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM orders WHERE order_id = ?";

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// Get full order info + products in one response
router.get("/:id/details", (req, res) => {
  const { id } = req.params;

  const orderQuery = `SELECT * FROM orders WHERE order_id = ?`;
  const productsQuery = `
    SELECT 
      p.product_id,
      p.name AS product_name,
      p.price AS unit_price,
      ocp.total_products AS quantity,
      (p.price * ocp.total_products) AS subtotal,
      p.color,
      p.size
    FROM order_contains_product ocp
    JOIN products p ON ocp.product_id = p.product_id
    WHERE ocp.order_id = ?
  `;

  db.query(orderQuery, [id], (err, orderResults) => {
    if (err) {
      console.error("Error fetching order info:", err);
      return res.status(500).send("Error fetching order info");
    }

    if (!orderResults.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    db.query(productsQuery, [id], (err2, productsResults) => {
      if (err2) {
        console.error("Error fetching order products:", err2);
        return res.status(500).send("Error fetching order products");
      }

      res.json({
        order: orderResults[0],
        products: productsResults,
      });
    });
  });
});

// Get orders by user email
router.get("/:email", (req, res) => {
  const { email } = req.params;

  const query = "SELECT * FROM orders WHERE email = ?";

  db.query(query, [email], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// Create new order
router.post("/", (req, res) => {
  const { email, total_amount, order_date, order_time } = req.body;

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
        return res.status(500).send(err);
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

    // Clear the cart after order is processed
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

// Delete products by category safely (new route example)
// Deletes entries from order_contains_product first, then products
router.delete("/products/category/:categoryId", (req, res) => {
  const { categoryId } = req.params;

  // 1. Delete dependent order_contains_product entries first
  const deleteDependentQuery = `
    DELETE ocp FROM order_contains_product ocp
    JOIN products p ON ocp.product_id = p.product_id
    WHERE p.category_id = ?
  `;

  // 2. Delete products themselves
  const deleteProductsQuery = `DELETE FROM products WHERE category_id = ?`;

  db.query(deleteDependentQuery, [categoryId], (err) => {
    if (err) {
      console.error(
        "Error deleting dependent order_contains_product rows:",
        err
      );
      return res.status(500).send("Error deleting dependent rows");
    }

    db.query(deleteProductsQuery, [categoryId], (err2) => {
      if (err2) {
        console.error("Error deleting products:", err2);
        return res.status(500).send("Error deleting products");
      }

      res.json({
        message: `Deleted products and dependent rows for category ${categoryId}`,
      });
    });
  });
});

// 📊 Get order statistics
router.get("/stats/dashboard", (req, res) => {
  const statsQuery = `
    SELECT 
      (SELECT name FROM products 
       JOIN order_contains_product ocp ON products.product_id = ocp.product_id 
       GROUP BY ocp.product_id 
       ORDER BY SUM(ocp.total_products) DESC 
       LIMIT 1) AS most_ordered_product,

      (SELECT SUM(total_amount) FROM orders) AS total_revenue,

      (SELECT COUNT(*) FROM orders) AS total_orders,

      (SELECT email FROM orders 
       GROUP BY email 
       ORDER BY COUNT(*) DESC 
       LIMIT 1) AS most_active_customer
  `;

  db.query(statsQuery, (err, results) => {
    if (err) {
      console.error("Error fetching order statistics:", err);
      return res.status(500).send("Error fetching statistics");
    }

    res.json(results[0]);
  });
});

// Send order confirmation email
router.post("/send-confirmation", async (req, res) => {
  const { email, orderId } = req.body;

  if (!email || !orderId) {
    return res.status(400).json({ error: "Missing email or order ID" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"NUVEL by Ali" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your Order #${orderId} Confirmation`,
      text: `Thank you for your purchase!\n\nYour order number is: ${orderId}\n\nWe will notify you once your items ship.`,
    });

    res.status(200).json({ message: "Confirmation email sent" });
  } catch (err) {
    console.error("Failed to send email:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
