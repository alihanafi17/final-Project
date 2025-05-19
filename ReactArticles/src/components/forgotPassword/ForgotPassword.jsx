import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./forgotPassword.module.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password1 !== password2) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8801/users/forgot-password/${email}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: password1 }),
        }
      );

      const data = await response.json();

      if (response.status === 404) {
        alert("This email does not exist in our system.");
      } else if (response.ok) {
        alert("Password updated successfully!");
        navigate("/login");
      } else {
        alert(data.message || "Password update failed");
      }
    } catch (error) {
      console.error("Password change error:", error);
      alert("An error occurred during password change.");
    }
  };

  return (
    <div className={classes.loginContainer}>
      <div className={classes.loginCard}>
        <h2 className={classes.loginTitle}>Reset Password</h2>

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
            <label htmlFor="password1" className={classes.formLabel}>
              New Password
            </label>
            <div className={classes.passwordContainer}>
              <input
                id="password1"
                type={showPassword1 ? "text" : "password"}
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                required
                className={classes.formInput}
                placeholder="Enter new password"
              />
              <img
                src="../../assets/img/hide_password_eye.png"
                alt="Toggle password visibility"
                onClick={() => setShowPassword1(!showPassword1)}
                className={classes.passwordIcon}
              />
            </div>
          </div>

          <div className={classes.formGroup}>
            <label htmlFor="password2" className={classes.formLabel}>
              Confirm New Password
            </label>
            <div className={classes.passwordContainer}>
              <input
                id="password2"
                type={showPassword2 ? "text" : "password"}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                className={classes.formInput}
                placeholder="Confirm new password"
              />
              <img
                src="../../assets/img/hide_password_eye.png"
                alt="Toggle password visibility"
                onClick={() => setShowPassword2(!showPassword2)}
                className={classes.passwordIcon}
              />
            </div>
          </div>

          <div className={classes.formActions}>
            <button type="submit" className={classes.loginButton}>
              Reset Password
            </button>
            <button
              type="button"
              className={classes.forgotButton}
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
