const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const db = dbSingleton.getConnection();
const nodemailer = require("nodemailer");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");

// Helper to send emails using nodemailer
async function sendEmail({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"NUVEL by Ali" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
}

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

router.post("/notify-admin", async (req, res) => {
  const { orderId, customerEmail } = req.body;
  console.log("Notify-admin called with:", req.body);

  try {
    await sendEmail({
      to: "alihanafi1720@gmail.com",
      subject: `New Order Waiting for Confirmation - #${orderId}`,
      text: `A new order (#${orderId}) from ${customerEmail} is waiting for confirmation. Please log in to the admin panel.`,
    });

    console.log("Admin notification email sent");
    res.status(200).json({ message: "Admin notified successfully" });
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    res.status(500).json({ error: "Failed to notify admin" });
  }
});

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

    // **Check if order already completed to prevent double update**
    if (order.status === "Completed") {
      return res.status(400).json({ error: "Order already completed" });
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

    // 3. Deduct stock and check for low inventory
    const products = await new Promise((resolve, reject) => {
      db.query(
        `SELECT p.product_id, p.name, p.quantity, ocp.total_products AS ordered_quantity
         FROM order_contains_product ocp
         JOIN products p ON ocp.product_id = p.product_id
         WHERE ocp.order_id = ?`,
        [id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    let lowStockProducts = [];

    for (let prod of products) {
      const newQuantity = prod.quantity - prod.ordered_quantity;

      // Prevent negative quantity
      const finalQuantity = newQuantity < 0 ? 0 : newQuantity;

      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE products SET quantity = ? WHERE product_id = ?",
          [finalQuantity, prod.product_id],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });

      if (finalQuantity <= 5) {
        lowStockProducts.push(
          `${prod.name} (ID: ${prod.product_id}, Remaining: ${finalQuantity})`
        );
      }
    }

    if (lowStockProducts.length > 0) {
      await sendEmail({
        to: "alihanafi1720@gmail.com",
        subject: "Low Stock Alert",
        text: `The following products are low in stock:\n\n${lowStockProducts.join(
          "\n"
        )}`,
      });
    }

    // 4. Send confirmation email to customer
    await sendEmail({
      to: order.email,
      subject: `Your Order #${order.order_id} is Completed and Shipped To You!`,
      text: `Hello,\n\nYour order #${order.order_id} has been completed. Thank you for shopping with us!\n\nBest regards,\nNUVEL by Ali`,
    });

    res.json({ message: "Order completed, stock updated, and emails sent" });
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

// Add products to an order
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

  db.query(insertQuery, [values], (err) => {
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

// Delete products by category safely
router.delete("/products/category/:categoryId", (req, res) => {
  const { categoryId } = req.params;

  const deleteDependentQuery = `
    DELETE ocp FROM order_contains_product ocp
    JOIN products p ON ocp.product_id = p.product_id
    WHERE p.category_id = ?
  `;

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
    await sendEmail({
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

router.put("/:id/reject", async (req, res) => {
  //console.log(`Reject order called for id=${req.params.id}`, req.body);
  const { id } = req.params;
  const { rejectionReason } = req.body;

  try {
    // 1. Update order status only (no rejection_reason column)
    await new Promise((resolve, reject) => {
      db.query(
        "UPDATE orders SET status = 'Rejected' WHERE order_id = ?",
        [id],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    // 2. Get order email for sending rejection reason
    const [order] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT email FROM orders WHERE order_id = ?",
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

    // 3. Send rejection email with reason text
    await sendEmail({
      to: order.email,
      subject: `Your Order #${id} Has Been Rejected`,
      text: `Hello,\n\nUnfortunately, your order #${id} has been rejected for the following reason:\n\n${rejectionReason}\n\nIf you have any questions, please contact us.\n\nBest regards,\nNUVEL by Ali`,
    });

    res.json({ message: "Order rejected and customer notified" });
  } catch (err) {
    console.error("Error rejecting order:", err);
    res.status(500).json({ error: "Failed to reject order" });
  }
});

// 📊 Revenue trend by month for chart
router.get("/stats/revenue-trend", (req, res) => {
  const trendQuery = `
    SELECT 
      DATE_FORMAT(order_date, '%Y-%m') AS month,
      SUM(total_amount) AS revenue
    FROM orders
    GROUP BY DATE_FORMAT(order_date, '%Y-%m')
    ORDER BY month ASC
  `;

  db.query(trendQuery, (err, results) => {
    if (err) {
      console.error("Error fetching revenue trend:", err);
      return res.status(500).send("Error fetching revenue trend");
    }

    // Format results for chart
    const formatted = results.map((r) => ({
      month: r.month,
      revenue: Number(r.revenue),
    }));

    res.json(formatted);
  });
});
// Export stats to Excel (one order per row, all products in one cell)
router.get("/stats/export", async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "startDate and endDate required" });
  }

  try {
    const query = `
      SELECT 
        o.order_id,
        o.email,
        o.total_amount,
        o.order_date,
        o.order_time,
        p.product_id,
        p.name AS product_name,
        p.color,
        p.size,
        ocp.total_products AS quantity,
        p.price AS unit_price
      FROM orders o
      JOIN order_contains_product ocp ON o.order_id = ocp.order_id
      JOIN products p ON ocp.product_id = p.product_id
      WHERE o.order_date BETWEEN ? AND ?
      ORDER BY o.order_date, o.order_time
    `;

    db.query(query, [startDate, endDate], async (err, results) => {
      if (err) return res.status(500).send(err);
      if (!results || results.length === 0) {
        return res
          .status(404)
          .json({ error: "No orders found for the selected date range." });
      }

      // Group products by order_id
      const ordersMap = {};
      results.forEach((row) => {
        if (!ordersMap[row.order_id]) {
          ordersMap[row.order_id] = {
            order_id: row.order_id,
            email: row.email,
            total_amount: row.total_amount,
            order_date: new Date(row.order_date).toLocaleDateString(),
            order_time: row.order_time,
            products: [],
          };
        }
        ordersMap[row.order_id].products.push({
          product_id: row.product_id,
          name: row.product_name,
          color: row.color,
          size: row.size,
          quantity: row.quantity,
          unit_price: row.unit_price,
          subtotal: row.unit_price * row.quantity,
        });
      });

      const orders = Object.values(ordersMap);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Orders Report");

      // Columns
      worksheet.columns = [
        { header: "Order ID", key: "order_id", width: 10 },
        { header: "Customer Email", key: "email", width: 25 },
        { header: "Total Amount", key: "total_amount", width: 15 },
        { header: "Order Date", key: "order_date", width: 15 },
        { header: "Order Time", key: "order_time", width: 10 },
        { header: "Products", key: "products_info", width: 100 },
      ];

      // Rows
      const excelData = orders.map((order) => {
        const productsInfo = order.products
          .map(
            (p) =>
              `ID: ${p.product_id}, Name: ${p.name}, Color: ${p.color}, Size: ${p.size}, Qty: ${p.quantity}, Price: $${p.unit_price}, Subtotal: $${p.subtotal}`
          )
          .join("\n"); // Each product on a new line
        return {
          ...order,
          products_info: productsInfo,
        };
      });

      worksheet.addRows(excelData);

      // Optional: wrap text for the Products column
      worksheet.getColumn("products_info").alignment = { wrapText: true };

      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=orders_${startDate}_to_${endDate}.xlsx`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(buffer);
    });
  } catch (err) {
    console.error("Error exporting Excel:", err);
    res.status(500).send("Failed to export Excel");
  }
});

router.get("/stats/products", async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "startDate and endDate required" });
  }

  try {
    const query = `
      SELECT p.product_id, p.name AS product_name,
             SUM(ocp.total_products) AS total_quantity_sold,
             SUM(ocp.total_products * p.price) AS total_revenue,
             ROUND(AVG(p.price), 2) AS avg_price
      FROM orders o
      JOIN order_contains_product ocp ON o.order_id = ocp.order_id
      JOIN products p ON ocp.product_id = p.product_id
      WHERE o.order_date BETWEEN ? AND ?
      GROUP BY p.product_id, p.name
      ORDER BY total_revenue DESC
    `;

    db.query(query, [startDate, endDate], async (err, results) => {
      if (err) return res.status(500).send(err);

      // Check if we have data
      if (!results || results.length === 0) {
        return res.status(404).json({
          error: "No product sales found for the selected date range.",
        });
      }

      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Product Sales Summary");

      // Add columns
      worksheet.columns = [
        { header: "Product ID", key: "product_id", width: 15 },
        { header: "Product Name", key: "product_name", width: 30 },
        {
          header: "Total Quantity Sold",
          key: "total_quantity_sold",
          width: 20,
        },
        { header: "Total Revenue", key: "total_revenue", width: 20 },
        { header: "Average Unit Price", key: "avg_price", width: 20 },
      ];

      // Add rows
      worksheet.addRows(results);

      // Write file to buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Send file as download
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=product_sales_${startDate}_to_${endDate}.xlsx`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.send(buffer);
    });
  } catch (err) {
    console.error("Error exporting product sales Excel:", err);
    res.status(500).send("Failed to export Excel");
  }
});
// New route: get orders by date range
router.get("/by-date", async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "startDate and endDate required" });
  }

  try {
    const query = `
      SELECT * 
      FROM orders
      WHERE order_date BETWEEN ? AND ?
      ORDER BY order_date DESC, order_time DESC
    `;

    db.query(query, [startDate, endDate], (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    });
  } catch (err) {
    console.error("Error fetching orders by date range:", err);
    res.status(500).send("Failed to fetch orders by date range");
  }
});

// Export a single order to Excel (all products in one row/column)
router.get("/export/:order_id", async (req, res) => {
  const { order_id } = req.params;

  if (!order_id) {
    return res.status(400).json({ error: "order_id is required." });
  }

  try {
    const query = `
      SELECT 
        o.order_id,
        o.email,
        o.total_amount,
        o.order_date,
        o.order_time,
        p.product_id,
        p.name AS product_name,
        p.color,
        p.size,
        ocp.total_products AS quantity,
        p.price AS unit_price
      FROM orders o
      JOIN order_contains_product ocp ON o.order_id = ocp.order_id
      JOIN products p ON ocp.product_id = p.product_id
      WHERE o.order_id = ?
    `;

    db.query(query, [order_id], async (err, results) => {
      if (err) return res.status(500).send(err);
      if (!results || results.length === 0) {
        return res.status(404).json({ error: "Order not found." });
      }

      const order = {
        order_id: results[0].order_id,
        email: results[0].email,
        total_amount: results[0].total_amount,
        order_date: new Date(results[0].order_date).toLocaleDateString(),
        order_time: results[0].order_time,
        products: results.map((row) => ({
          product_id: row.product_id,
          name: row.product_name,
          color: row.color,
          size: row.size,
          quantity: row.quantity,
          unit_price: row.unit_price,
          subtotal: row.unit_price * row.quantity,
        })),
      };

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Order_${order_id}`);

      worksheet.columns = [
        { header: "Order ID", key: "order_id", width: 10 },
        { header: "Customer Email", key: "email", width: 25 },
        { header: "Total Amount", key: "total_amount", width: 15 },
        { header: "Order Date", key: "order_date", width: 15 },
        { header: "Order Time", key: "order_time", width: 10 },
        { header: "Products", key: "products_info", width: 100 },
      ];

      const productsInfo = order.products
        .map(
          (p) =>
            `ID: ${p.product_id}, Name: ${p.name}, Color: ${p.color}, Size: ${p.size}, Qty: ${p.quantity}, Price: $${p.unit_price}, Subtotal: $${p.subtotal}`
        )
        .join("\n");

      worksheet.addRow({
        order_id: order.order_id,
        email: order.email,
        total_amount: order.total_amount,
        order_date: order.order_date,
        order_time: order.order_time,
        products_info: productsInfo,
      });

      // Wrap text for products column
      worksheet.getColumn("products_info").alignment = { wrapText: true };

      const buffer = await workbook.xlsx.writeBuffer();

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=order_${order_id}.xlsx`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(buffer);
    });
  } catch (err) {
    console.error("Error exporting single order Excel:", err);
    res.status(500).send("Failed to export order Excel.");
  }
});

router.get("/:orderId/pdf", (req, res) => {
  const { orderId } = req.params;

  const orderQuery = `
    SELECT o.order_id, o.email, o.total_amount, o.order_date, o.order_time,
           p.product_id, p.name AS product_name, p.color, p.size, p.price AS unit_price,
           ocp.total_products
    FROM orders o
    JOIN order_contains_product ocp ON o.order_id = ocp.order_id
    JOIN products p ON ocp.product_id = p.product_id
    WHERE o.order_id = ?
  `;

  db.query(orderQuery, [orderId], (err, results) => {
    if (err) return res.status(500).send("Database error: " + err);
    if (results.length === 0) return res.status(404).send("Order not found");

    const order = {
      order_id: results[0].order_id,
      email: results[0].email,
      total_amount: Number(results[0].total_amount),
      order_date: results[0].order_date,
      order_time: results[0].order_time,
    };

    const products = results.map((p) => ({
      product_id: p.product_id,
      product_name: p.product_name,
      color: p.color,
      size: p.size,
      quantity: p.total_products,
      unit_price: Number(p.unit_price),
      subtotal: Number(p.unit_price) * p.total_products,
    }));

    // Increased page width (800px) and reduced margin
    const doc = new PDFDocument({ size: [800, 1000], margin: 30 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="order_${order.order_id}.pdf"`
    );

    // Header
    doc.fontSize(20).text("Nuvel By Ali - Order Receipt", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Order ID: ${order.order_id}`)
      .text(`Customer Email: ${order.email}`)
      .text(`Date: ${new Date(order.order_date).toLocaleDateString()}`)
      .text(`Time: ${order.order_time}`)
      .moveDown();

    // Table
    const tableTop = doc.y + 10;
    const itemX = 30;
    const rowHeight = 25;
    const colWidths = [100, 200, 80, 60, 50, 80, 80]; // slightly wider columns

    // Header
    const headers = [
      "ID",
      "Name",
      "Color",
      "Size",
      "Qty",
      "Unit Price",
      "Subtotal",
    ];
    headers.forEach((h, i) => {
      doc
        .rect(
          itemX + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
          tableTop,
          colWidths[i],
          rowHeight
        )
        .stroke();
      doc
        .font("Helvetica-Bold")
        .text(
          h,
          itemX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 3,
          tableTop + 7,
          {
            width: colWidths[i] - 6,
            align: i >= 4 ? "right" : "left",
          }
        );
    });

    // Rows
    let y = tableTop + rowHeight;
    products.forEach((p) => {
      const values = [
        p.product_id,
        p.product_name,
        p.color,
        p.size,
        p.quantity,
        `$${p.unit_price.toFixed(2)}`,
        `$${p.subtotal.toFixed(2)}`,
      ];

      values.forEach((v, i) => {
        doc
          .rect(
            itemX + colWidths.slice(0, i).reduce((a, b) => a + b, 0),
            y,
            colWidths[i],
            rowHeight
          )
          .stroke();

        if (typeof v === "string" && v.length > 30) v = v.slice(0, 27) + "...";

        doc
          .font("Helvetica")
          .text(
            v,
            itemX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + 3,
            y + 7,
            {
              width: colWidths[i] - 6,
              align: i >= 4 ? "right" : "left",
            }
          );
      });
      y += rowHeight;
    });

    // Total row (right aligned)
    doc
      .rect(
        itemX + colWidths.slice(0, 5).reduce((a, b) => a + b, 0),
        y,
        colWidths[5] + colWidths[6],
        rowHeight
      )
      .stroke();
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(
        "Total:",
        itemX + colWidths.slice(0, 5).reduce((a, b) => a + b, 0) + 3,
        y + 7
      )
      .text(
        `$${order.total_amount.toFixed(2)}`,
        itemX +
          colWidths.slice(0, 5).reduce((a, b) => a + b, 0) +
          colWidths[5] -
          3,
        y + 7,
        {
          width: colWidths[6],
          align: "right",
        }
      );

    doc.end();
    doc.pipe(res);
  });
});

module.exports = router;
