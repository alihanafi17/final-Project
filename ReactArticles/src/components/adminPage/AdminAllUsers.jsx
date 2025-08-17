import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./adminAllUsers.module.css";

function AdminAllUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [confirmAction, setConfirmAction] = useState(""); // "toggle" | "delete"

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8801/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const seeOrders = async (email) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8801/orders/${email}`);
      setSelectedUserEmail(email);
      setUserOrders(res.data);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const seeOrderDetails = async (orderId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8801/orders/${orderId}/details`
      );
      setSelectedOrder(res.data);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
    } finally {
      setLoading(false);
    }
  };

  const goBackToUsers = () => {
    setSelectedUserEmail(null);
    setUserOrders([]);
    setSelectedOrder(null);
  };

  const goBackToOrders = () => {
    setSelectedOrder(null);
  };

  const confirmToggleAdmin = (user) => {
    setUserToToggle(user);
    setConfirmAction("toggle");
    setShowConfirm(true);
  };

  const confirmDeleteUser = (user) => {
    setUserToToggle(user);
    setConfirmAction("delete");
    setShowConfirm(true);
  };

  const handleToggleAdmin = async () => {
    if (!userToToggle) return;
    const newRole = userToToggle.role === "admin" ? "user" : "admin";
    try {
      await axios.put(`http://localhost:8801/users/${userToToggle.email}`, {
        role: newRole,
        name: userToToggle.name,
        address: userToToggle.address,
        phone: userToToggle.phone,
      });
      fetchUsers();
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setShowConfirm(false);
      setUserToToggle(null);
      setConfirmAction("");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToToggle) return;
    try {
      await axios.delete(`http://localhost:8801/users/${userToToggle.email}`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
    } finally {
      setShowConfirm(false);
      setUserToToggle(null);
      setConfirmAction("");
    }
  };

  if (loading)
    return <div className={styles.adminUsersContainer}>Loading...</div>;

  // --- Single order details ---
  if (selectedOrder) {
    const { order, products } = selectedOrder;
    return (
      <div className={styles.adminUsersContainer}>
        <button className={styles.backButton} onClick={goBackToOrders}>
          &larr; Back to Orders
        </button>
        <h2>Order Details (ID: {order.order_id})</h2>
        <p>
          Customer: {order.email} | Total: ${order.total_amount} | Date:{" "}
          {new Date(order.order_date).toLocaleDateString()} | Time:{" "}
          {order.order_time}
        </p>
        <table className={styles.orderDetailsTable}>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Name</th>
              <th>Color</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.product_id}>
                <td>{p.product_id}</td>
                <td>{p.product_name}</td>
                <td>{p.color}</td>
                <td>{p.size}</td>
                <td>{p.quantity}</td>
                <td>${p.unit_price}</td>
                <td>${p.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // --- User's orders ---
  if (selectedUserEmail) {
    return (
      <div className={styles.adminUsersContainer}>
        <button className={styles.backButton} onClick={goBackToUsers}>
          &larr; Back to Users
        </button>
        <h2>Orders for {selectedUserEmail}</h2>
        {userOrders.length === 0 ? (
          <p className={styles.noData}>No orders found for this user.</p>
        ) : (
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Total Amount</th>
                <th>Date</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userOrders.map((order) => (
                <tr key={order.order_id}>
                  <td>{order.order_id}</td>
                  <td>${order.total_amount}</td>
                  <td>{new Date(order.order_date).toLocaleDateString()}</td>
                  <td>{order.order_time}</td>
                  <td>
                    <button onClick={() => seeOrderDetails(order.order_id)}>
                      Order Details
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `http://localhost:8801/orders/${order.order_id}/pdf`,
                          "_blank"
                        )
                      }
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // --- All users ---
  return (
    <div className={styles.adminUsersContainer}>
      <h2>All Users</h2>
      {users.length === 0 ? (
        <p className={styles.noData}>No users found.</p>
      ) : (
        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.address || "-"}</td>
                <td>{user.phone || "-"}</td>
                <td>
                  <button onClick={() => confirmToggleAdmin(user)}>
                    {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                  </button>
                  {user.role !== "admin" && (
                    <>
                      <button onClick={() => seeOrders(user.email)}>
                        See Orders
                      </button>
                      <button onClick={() => confirmDeleteUser(user)}>
                        Remove User
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- Confirmation Popup --- */}
      {showConfirm && userToToggle && (
        <div className={styles.confirmPopup}>
          <div className={styles.confirmContent}>
            <p>
              {confirmAction === "toggle"
                ? `Are you sure you want to ${
                    userToToggle.role === "admin"
                      ? "remove admin rights from"
                      : "make"
                  } ${userToToggle.name} an admin?`
                : `Are you sure you want to remove user ${userToToggle.name}?`}
            </p>
            <div className={styles.confirmButtons}>
              <button
                onClick={
                  confirmAction === "toggle"
                    ? handleToggleAdmin
                    : handleDeleteUser
                }
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setUserToToggle(null);
                  setConfirmAction("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAllUsers;
