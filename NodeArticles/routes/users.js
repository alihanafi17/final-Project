const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const bcrypt = require("bcrypt");

const db = dbSingleton.getConnection();

router.get("/", (req, res) => {
  db.query("SELECT id, name, email, role FROM users", (err, users) => {
    if (err) throw err;
    res.json(users);
  });
});

const jwt = require("jsonwebtoken"); // add this at the top

// Secret key (store in .env in real apps)
const JWT_SECRET = "your_secret_key"; // use process.env.JWT_SECRET in production

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
        JWT_SECRET, // Changed from SECRET_KEY to JWT_SECRET
        { expiresIn: "1d" }
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
          phone: user.phone
        },
      });
    });
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

router.get("/check-auth", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    const query =
      "SELECT name, email, address, phone, role FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err || results.length === 0) {
        return res
          .status(403)
          .json({ loggedIn: false, message: "User not found" });
      }

      const user = results[0];
      res.json({ loggedIn: true, user });
    });
  } catch (err) {
    res
      .status(403)
      .json({ loggedIn: false, message: "Invalid or expired token" });
  }
});

router.get("/:email", (req, res) => {
  const { email } = req.params;
  db.query(
    "SELECT id, name, email, role, address, phone FROM users WHERE email = ?",
    [email],
    (err, users) => {
      if (err) throw err;

      if (users.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(users[0]);
    }
  );
});

router.post("/", (req, res) => {
  const { email, name, password, address, role, phone } = req.body;

  db.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
    (err, existingUsers) => {
      if (err) {
        console.error("Database error during email check:", err);
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }

      if (existingUsers.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }

      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          console.error("Error generating salt:", err);
          return res
            .status(500)
            .json({ success: false, message: "Encryption error" });
        }

        bcrypt.hash(password, salt, (err, hashedPass) => {
          if (err) {
            console.error("Error hashing password:", err);
            return res
              .status(500)
              .json({ success: false, message: "Encryption error" });
          }

          db.query(
            "INSERT INTO users (name, email, password, address, role, phone) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, hashedPass, address, role, phone],
            (err, result) => {
              if (err) {
                console.error("Error inserting user:", err);
                return res.status(500).json({
                  success: false,
                  message: "Database insertion error",
                });
              }

              db.query(
                "SELECT id, name, email, role, address, phone FROM users WHERE id = ?",
                [result.insertId],
                (err, users) => {
                  if (err) {
                    console.error("Error retrieving new user:", err);
                    return res.status(500).json({
                      success: false,
                      message: "Database fetch error",
                    });
                  }

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
      });
    }
  );
});

router.put("/:email", (req, res) => {
  const { email } = req.params;
  const { name, address, phone } = req.body;

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, users) => {
    if (err) throw err;

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateUser = (hashedPass = null) => {
      let query = "UPDATE users SET name = ?, address = ?, phone = ?";
      const params = [name, address, phone];

      if (hashedPass) {
        query += ", password = ?";
        params.push(hashedPass);
      }

      query += " WHERE email = ?";
      params.push(email);

      db.query(query, params, (err) => {
        if (err) throw err;

        db.query(
          "SELECT id, name, email, role, address, phone FROM users WHERE email = ?",
          [email],
          (err, updatedUsers) => {
            if (err) throw err;
            res.json({
              message: "User updated successfully",
              user: updatedUsers[0],
            });
          }
        );
      });
    };

    updateUser();
  });
});

router.put("/forgot-password/:email", (req, res) => {
  const { email } = req.params;
  const { password } = req.body;

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, users) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateUser = (hashedPass) => {
      const query = "UPDATE users SET password = ? WHERE email = ?";
      const params = [hashedPass, email];

      db.query(query, params, (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Error updating user", error: err });

        db.query(
          "SELECT email FROM users WHERE email = ?",
          [email],
          (err, updatedUsers) => {
            if (err)
              return res
                .status(500)
                .json({ message: "Error fetching updated user", error: err });

            res.json({
              message: "Password updated successfully",
              user: updatedUsers[0],
            });
          }
        );
      });
    };

    if (password) {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(password, salt, (err, hashedPass) => {
          if (err) throw err;
          updateUser(hashedPass);
        });
      });
    } else {
      updateUser();
    }
  });
});

router.delete("/:email", (req, res) => {
  const { email } = req.params;

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, users) => {
    if (err) throw err;

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    db.query("DELETE FROM users WHERE email = ?", [email], (err) => {
      if (err) throw err;
      res.json({ message: "User deleted successfully" });
    });
  });
});

module.exports = router;
