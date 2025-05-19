import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./forgotPassword.module.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
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
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">your Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
        <label htmlFor="password">your new Password</label>
        <input
          id="password1"
          type="text"
          value={password1}
          onChange={(e) => setPassword1(e.target.value)}
          required
          placeholder="Enter new password"
        />
        <label htmlFor="password">your new Password again</label>
        <input
          id="password2"
          type="text"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
          placeholder="Enter new password again"
        />
        <button type="submit">Change password</button>
      </form>
    </div>
  );
}

export default ForgotPassword;
