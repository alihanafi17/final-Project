import React, { useState, useEffect } from "react";
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
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();
  
  // Function to show notifications
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };
  
  // Clear notification when component unmounts
  useEffect(() => {
    return () => {
      setNotification({ show: false, message: "", type: "" });
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
          role: "user",
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification("Registration successful! Redirecting to login...", "success");
        // Delay navigation to allow user to see the success message
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Failed to connect to server. Please try again later.");
    }
  };

  return (
    <div className={classes.registerContainer}>
      {notification.show && (
        <div className={`${classes.notification} ${classes[notification.type]}`}>
          <div className={classes.notificationContent}>
            <span className={classes.notificationMessage}>{notification.message}</span>
            <button 
              className={classes.notificationClose} 
              onClick={() => setNotification({ show: false, message: "", type: "" })}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className={classes.registerCard}>
        <h2 className={classes.registerTitle}>Join us!</h2>

        {error && <div className={classes.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={classes.registerForm}>
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
            <button type="submit" className={classes.registerButton}>
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
