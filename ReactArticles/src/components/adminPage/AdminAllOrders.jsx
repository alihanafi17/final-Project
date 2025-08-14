import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./adminPage.module.css";

function AdminAllOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchId, searchEmail, orders]);

  const fetchAllOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8801/orders");
      const ordersData = res.data;

      const ordersWithProducts = await Promise.all(
        ordersData.map(async (order) => {
          try {
            const detailsRes = await axios.get(
              `http://localhost:8801/orders/${order.order_id}/details`
            );
            return detailsRes.data; // { order: {...}, products: [...] }
          } catch (err) {
            console.error(
              `Failed to fetch products for order ${order.order_id}`,
              err
            );
            return { order, products: [] };
          }
        })
      );

      setOrders(ordersWithProducts);
      setFilteredOrders(ordersWithProducts);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchId.trim() !== "") {
      filtered = filtered.filter(({ order }) =>
        String(order.order_id).includes(searchId.trim())
      );
    }

    if (searchEmail.trim() !== "") {
      filtered = filtered.filter(({ order }) =>
        order.email.toLowerCase().includes(searchEmail.trim().toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  if (loading)
    return <div className={styles.loading}>Loading all orders...</div>;

  return (
    <div className={styles.ordersContainer}>
      <h2>All Orders</h2>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search by Order ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Customer Email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        filteredOrders.map(({ order, products }) => (
          <div key={order.order_id} className={styles.orderCard}>
            <div className={styles.header}>
              <span>Order #{order.order_id}</span>
              <span className={styles.status}>{order.status}</span>
            </div>

            <div className={styles.orderInfo}>
              <p>
                <strong>Customer:</strong> {order.email}
              </p>
              <p>
                <strong>Total:</strong> ${Number(order.total_amount).toFixed(2)}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.order_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {order.order_time}
              </p>
            </div>

            {products && products.length > 0 && (
              <div className={styles.productsList}>
                <h4>Products in this order:</h4>
                <table className={styles.productsTable}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Color</th>
                      <th>Size</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.product_id}>
                        <td>{product.product_id}</td>
                        <td>{product.product_name}</td>
                        <td>{product.color}</td>
                        <td>{product.size}</td>
                        <td>{product.quantity}</td>
                        <td>${Number(product.unit_price).toFixed(2)}</td>
                        <td>${Number(product.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default AdminAllOrders;
