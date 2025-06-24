import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import styles from "./userPage.module.css";

function UserPage() {
  const { user } = useAuth();

  const [Name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

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
      fetchUserOrders(user.email);
    }
  }, [user]);

  const fetchUserOrders = async (email) => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const response = await fetch(`http://localhost:8801/orders/${email}`);
      if (!response.ok) {
        throw new Error(`Error fetching orders: ${response.statusText}`);
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrdersError("Failed to load your orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:8801/users/${user.email}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: Name,
            address: address,
            phone: phone,
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
            <span className={styles.notificationMessage}>
              {notification.message}
            </span>
            <button
              className={styles.notificationClose}
              onClick={() =>
                setNotification({ show: false, message: "", type: "" })
              }
              aria-label="Close notification"
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

              <button type="submit" className={styles.updateButton}>
                Update Profile
              </button>
            </form>
          </div>
        </section>

        {/* Orders Section */}
        <section className={styles.ordersSection}>
          <h2 className={styles.sectionTitle}>My Orders</h2>
          <div className={styles.ordersCard}>
            {ordersLoading ? (
              <p>Loading your orders...</p>
            ) : ordersError ? (
              <p className={styles.errorMessage}>{ordersError}</p>
            ) : orders.length === 0 ? (
              <p className={styles.noOrders}>You don't have any orders yet.</p>
            ) : (
              <table className={styles.ordersTable} aria-label="User Orders">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Order Date</th>
                    <th>Order Time</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.order_id}>
                      <td>{order.order_id}</td>
                      <td>${Number(order.total_amount).toFixed(2)}</td>
                      <td>{"Completed"}</td>
                      <td>{new Date(order.order_date).toLocaleDateString()}</td>
                      <td>{order.order_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserPage;
