import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./registerPage.module.css";
import hidePassword from "../../assets/img/hide_password_eye.png";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8801/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name,
          address,
          phone,
          role: "user", // default role
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(data.success);
        alert("Registration successful!");
        navigate("/login");
      } else {
        alert("Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("An error occurred during registration.");
    }
  };

  return (
    <div className={classes.loginContainer}>
      <div className={classes.loginCard}>
        <h2 className={classes.loginTitle}>Register</h2>

        <form onSubmit={handleSubmit} className={classes.loginForm}>
          <div className={classes.formGroup}>
            <label htmlFor="name" className={classes.formLabel}>
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={classes.formInput}
              placeholder="Enter your name"
            />
          </div>

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

          <div className={classes.formGroup}>
            <label htmlFor="address" className={classes.formLabel}>
              Address
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className={classes.formInput}
              placeholder="Enter your address"
            />
          </div>

          <div className={classes.formGroup}>
            <label htmlFor="phone" className={classes.formLabel}>
              Phone
            </label>
            <input
              id="phone"
              type="number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className={`${classes.formInput} ${classes.noSpinner}`}
              placeholder="Enter your phone number"
            />
          </div>

          <div className={classes.formActions}>
            <button type="submit" className={classes.loginButton}>
              Register
            </button>
            <button
              type="button"
              className={classes.forgotButton}
              onClick={() => navigate("/login")}
            >
              Already have an account?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
