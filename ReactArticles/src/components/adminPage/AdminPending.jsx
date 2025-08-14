import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./adminPage.module.css";

function AdminPending() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingOrderId, setRejectingOrderId] = useState(null);

  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchPendingOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8801/orders/pending");
      setPendingOrders(res.data);
    } catch {
      setMessage({ text: "Failed to load pending orders", type: "error" });
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await axios.get(`http://localhost:8801/orders/${orderId}/details`);
      return res.data;
    } catch {
      setMessage({ text: "Failed to load order details", type: "error" });
      return null;
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    const details = await fetchOrderDetails(orderId);
    if (details) {
      setSelectedOrderDetails(details);
      setShowOrderDetailsModal(true);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await axios.put(`http://localhost:8801/orders/${orderId}/complete`);
      setMessage({ text: `Order #${orderId} marked as completed`, type: "success" });
      fetchPendingOrders();
    } catch {
      setMessage({ text: "Failed to complete order", type: "error" });
    }
  };

  const handleOpenRejectModal = (orderId) => {
    setRejectReason("");
    setRejectingOrderId(orderId);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }
    try {
      await axios.put(`http://localhost:8801/orders/${rejectingOrderId}/reject`, {
        rejectionReason: rejectReason,
      });
      setMessage({ text: `Order #${rejectingOrderId} rejected and user notified.`, type: "success" });
      fetchPendingOrders();
    } catch {
      setMessage({ text: "Failed to reject order", type: "error" });
    }
    setShowRejectModal(false);
    setRejectReason("");
    setRejectingOrderId(null);
  };

  return (
    <div className={styles.pendingOrdersSection}>
      <h2>Pending Orders</h2>

      {message.text && (
        <div className={message.type === "error" ? styles.errorMessage : styles.successMessage}>
          {message.text}
        </div>
      )}

      {pendingOrders.length === 0 ? (
        <p>No pending orders</p>
      ) : (
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Email</th>
              <th>Total Amount</th>
              <th>Date</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.map((order) => (
              <tr key={order.order_id}>
                <td>{order.order_id}</td>
                <td>{order.email}</td>
                <td>${Number(order.total_amount).toFixed(2)}</td>
                <td>{new Date(order.order_date).toLocaleDateString()}</td>
                <td>{order.order_time}</td>
                <td>
                  <button
                    onClick={() => handleConfirmOrder(order.order_id)}
                    className={styles.confirmButton}
                    style={{ marginRight: "8px" }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleViewOrderDetails(order.order_id)}
                    className={styles.detailsButton}
                    style={{ marginRight: "8px" }}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleOpenRejectModal(order.order_id)}
                    className={styles.rejectButton}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Order Details Modal */}
      {showOrderDetailsModal && selectedOrderDetails && (
        <div className={styles.modalOverlay} onClick={() => setShowOrderDetailsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalButton} onClick={() => setShowOrderDetailsModal(false)}>
              ×
            </button>
            <h3>Order Details - #{selectedOrderDetails.order.order_id}</h3>
            <p><strong>Email:</strong> {selectedOrderDetails.order.email}</p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedOrderDetails.order.order_date).toLocaleDateString()}
            </p>
            <p>
              <strong>Time:</strong> {selectedOrderDetails.order.order_time}
            </p>
            <table className={styles.detailsTable}>
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                  <th>Color</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrderDetails.products.map((prod) => (
                  <tr key={prod.product_id}>
                    <td>{prod.product_id}</td>
                    <td>{prod.product_name}</td>
                    <td>{prod.quantity}</td>
                    <td>${Number(prod.unit_price ?? 0).toFixed(2)}</td>
                    <td>${Number(prod.subtotal ?? 0).toFixed(2)}</td>
                    <td>{prod.color}</td>
                    <td>{prod.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalButton} onClick={() => setShowRejectModal(false)}>
              ×
            </button>
            <h3>Reject Order #{rejectingOrderId}</h3>
            <label>Please enter the reason for rejection:</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={5}
              style={{ width: "100%", marginTop: "8px" }}
            />
            <div style={{ marginTop: "1rem", textAlign: "right" }}>
              <button
                onClick={handleRejectSubmit}
                className={styles.rejectSubmitButton}
                style={{ marginRight: "8px" }}
              >
                Submit
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className={styles.cancelButton}
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

export default AdminPending;
