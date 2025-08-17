const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = dbSingleton.getConnection();
const JWT_SECRET = "your_secret_key"; // Replace with process.env.JWT_SECRET in production

// ===== Middleware for protected routes =====
const authenticateUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ===== Get all users (admin only ideally) =====
router.get("/", (req, res) => {
  db.query("SELECT * FROM users", (err, users) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    res.json(users);
  });
});

// ===== Login =====
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!match) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      const token = jwt.sign(
        { email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: "Login successful!",
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address,
          phone: user.phone,
        },
      });
    });
  });
});

// ===== Logout =====
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// ===== Check Auth =====
router.get("/check-auth", authenticateUser, (req, res) => {
  const { email, role } = req.user; // <-- extract role as well

  db.query(
    "SELECT name, email, address, phone, role FROM users WHERE email = ?",
    [email],
    (err, results) => {
      if (err || results.length === 0) {
        return res
          .status(403)
          .json({ loggedIn: false, message: "User not found" });
      }
      const user = results[0];
      res.json({ loggedIn: true, user }); // user includes role
    }
  );
});

// ===== Get user by email =====
router.get("/:email", (req, res) => {
  const { email } = req.params;
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, users) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    if (users.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(users[0]);
  });
});

// ===== Register user =====
router.post("/", (req, res) => {
  const { email, name, password, address, role, phone } = req.body;

  db.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
    (err, existingUsers) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      if (existingUsers.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }

      bcrypt.hash(password, 10, (err, hashedPass) => {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: "Encryption error" });

        db.query(
          "INSERT INTO users (name, email, password, address, role, phone) VALUES (?, ?, ?, ?, ?, ?)",
          [name, email, hashedPass, address, role, phone],
          (err, result) => {
            if (err)
              return res
                .status(500)
                .json({ success: false, message: "Database insertion error" });

            db.query(
              "SELECT id, name, email, role, address, phone FROM users WHERE id = ?",
              [result.insertId],
              (err, users) => {
                if (err)
                  return res
                    .status(500)
                    .json({ success: false, message: "Database fetch error" });

                res.status(201).json({
                  success: true,
                  message: "User created successfully",
                  user: users[0],
                });
              }
            );
          }
        );
      });
    }
  );
});

router.put("/:email", (req, res) => {
  const { email } = req.params;
  const { name, address, phone, password, role } = req.body; // <-- added role

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, users) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    if (users.length === 0)
      return res.status(404).json({ message: "User not found" });

    const updateUser = (hashedPass = null) => {
      let query = "UPDATE users SET name = ?, address = ?, phone = ?";
      const params = [name, address, phone];

      if (role) {
        query += ", role = ?";
        params.push(role);
      }

      if (hashedPass) {
        query += ", password = ?";
        params.push(hashedPass);
      }

      query += " WHERE email = ?";
      params.push(email);

      db.query(query, params, (err) => {
        if (err)
          return res.status(500).json({ message: "Update error", error: err });

        db.query(
          "SELECT id, name, email, role, address, phone FROM users WHERE email = ?",
          [email],
          (err, updatedUsers) => {
            if (err)
              return res
                .status(500)
                .json({ message: "Fetch error", error: err });
            res.json({
              message: "User updated successfully",
              user: updatedUsers[0],
            });
          }
        );
      });
    };

    if (password) {
      bcrypt.hash(password, 10, (err, hashedPass) => {
        if (err) return res.status(500).json({ message: "Encryption error" });
        updateUser(hashedPass);
      });
    } else {
      updateUser();
    }
  });
});

// ===== Forgot password =====
router.put("/forgot-password/:email", (req, res) => {
  const { email } = req.params;
  const { password } = req.body;

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, users) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    if (users.length === 0)
      return res.status(404).json({ message: "User not found" });

    bcrypt.hash(password, 10, (err, hashedPass) => {
      if (err) return res.status(500).json({ message: "Encryption error" });

      db.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashedPass, email],
        (err) => {
          if (err)
            return res
              .status(500)
              .json({ message: "Update error", error: err });

          res.json({ message: "Password updated successfully", email });
        }
      );
    });
  });
});

// ===== Delete user =====
router.delete("/:email", (req, res) => {
  const { email } = req.params;

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, users) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    if (users.length === 0)
      return res.status(404).json({ message: "User not found" });

    db.query("DELETE FROM users WHERE email = ?", [email], (err) => {
      if (err)
        return res.status(500).json({ message: "Delete error", error: err });
      res.json({ message: "User deleted successfully" });
    });
  });
});

// ===== Export =====
module.exports = router;
module.exports.authenticateUser = authenticateUser;
