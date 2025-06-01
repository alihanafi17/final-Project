import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import styles from "./userPage.module.css";

function UserPage() {
  const { user } = useAuth();

  const [Name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  
  // Function to show notifications instead of alerts
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAddress(user.address || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const navigate = useNavigate();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Function is already defined above

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:8801/users/${user.email}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name: Name,
            address: address,
            phone: phone
          }),
        }
      );

      const data = await response.json();

      if (response.status === 404) {
        showNotification("User not found", "error");
      } else if (response.ok) {
        showNotification("User updated successfully!", "success");
        navigate(`/userPage/${user.email}`);
      } else {
        showNotification(data.message || "User update failed", "error");
      }
    } catch (error) {
      console.error("User update error:", error);
      showNotification("An error occurred during user update.", "error");
    }
  };

  return (
    <div className={styles.userPageContainer}>
      {notification.show && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          <div className={styles.notificationContent}>
            <span className={styles.notificationMessage}>{notification.message}</span>
            <button 
              className={styles.notificationClose} 
              onClick={() => setNotification({ show: false, message: "", type: "" })}
            >
              ×
            </button>
          </div>
        </div>
      )}
      <h1 className={styles.pageTitle}>My Account</h1>
      
      <div className={styles.userPageContent}>
        {/* Profile Section */}
        <section className={styles.profileSection}>
          <h2 className={styles.sectionTitle}>Profile Information</h2>
          <div className={styles.profileCard}>
            <form onSubmit={handleSubmit} className={styles.profileForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={Name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Address</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              
              <button type="submit" className={styles.updateButton}>Update Profile</button>
            </form>
          </div>
        </section>
        
        {/* Orders Section */}
        <section className={styles.ordersSection}>
          <h2 className={styles.sectionTitle}>My Orders</h2>
          <div className={styles.ordersCard}>
            <p className={styles.noOrders}>You don't have any orders yet.</p>
            {/* Order history will be displayed here */}
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserPage;
