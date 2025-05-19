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

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, match) => {
      if (err) throw err;

      if (!match) {
        return res.json({
          success: false,
          message: "Invalid email or password",
        });
      }

      res.json({
        success: true,
        message: "Login successful!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  });
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
  const { name, password, address, role, phone } = req.body;

  db.query("SELECT id FROM users WHERE email = ?", [email], (err, users) => {
    if (err) throw err;

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateUser = (hashedPass = null) => {
      let query = "UPDATE users SET name = ?, address = ?, role = ?, phone = ?";
      const params = [name, address, role, phone];

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
