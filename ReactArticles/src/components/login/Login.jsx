import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./login.module.css";
import hidePassword from "../../assets/img/hide_password_eye.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8801/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Login successful!");
        const role = data.user.role;
        navigate(role === "admin" ? "/adminPage" : "/userPage");
      } else {
        alert("Invalid email or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Failed to connect to server.");
    }
  };

  return (
    <div className={classes.loginContainer}>
      <div className={classes.loginCard}>
        <h2 className={classes.loginTitle}>Login</h2>

        <form onSubmit={handleSubmit} className={classes.loginForm}>
          <div className={classes.formGroup}>
            <label htmlFor="email" className={classes.formLabel}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={classes.formInput}
              placeholder="Enter your email"
            />
          </div>

          <div className={classes.formGroup}>
            <label htmlFor="password" className={classes.formLabel}>
              Password
            </label>
            <div className={classes.passwordContainer}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={classes.formInput}
                placeholder="Enter your password"
              />
              <img
                src={hidePassword}
                alt="Toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                className={classes.passwordIcon}
              />
            </div>
          </div>

          <div className={classes.formActions}>
            <button type="submit" className={classes.loginButton}>
              Login
            </button>
            <button
              type="button"
              className={classes.forgotButton}
              onClick={() => navigate("/forgotPassword")}
            >
              Forgot Password?
            </button>
            <button
              type="button"
              className={classes.forgotButton}
              onClick={() => navigate("/registerPage")}
            >
              Not a user yet?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
