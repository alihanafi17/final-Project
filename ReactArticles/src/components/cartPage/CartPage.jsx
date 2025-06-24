import React, { useEffect, useState } from "react";
import axios from "axios";
import { checkAuth } from "../../auth"; // Make sure the path matches your project structure

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(null);

  // Validate session on load
  useEffect(() => {
    const validateAuth = async () => {
      const result = await checkAuth();
      if (result.authenticated && result.email) {
        setEmail(result.email);
        fetchCartItems(result.email);
      } else {
        setEmail(null);
        setCartItems([]);
        setError("You must be logged in to view the cart.");
        setLoading(false);
      }
    };

    validateAuth();
  }, []);

  // Listen for localStorage logout (multi-tab sync)
  useEffect(() => {
    const handleStorageChange = () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        setEmail(null);
        setCartItems([]);
        setError("You must be logged in to view the cart.");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const fetchCartItems = (userEmail) => {
    setLoading(true);
    axios
      .get(`http://localhost:8801/cart/${userEmail}`)
      .then((res) => {
        setCartItems(res.data);
        setError("");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch cart:", err);
        setError("Failed to load cart.");
        setLoading(false);
      });
  };

  const handleDelete = (product_id) => {
    if (!email) return;

    axios
      .delete(`http://localhost:8801/cart/${email}/${product_id}`)
      .then(() => {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.product_id !== product_id)
        );
      })
      .catch((err) => {
        console.error("Failed to delete item:", err);
        alert("Failed to delete item from cart.");
      });
  };

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading cart...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Your Cart</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Your Cart</h2>
        <p>No products in cart yet.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Your Cart</h2>
      {cartItems.map((item) => (
        <div
          key={item.product_id}
          style={{
            marginBottom: "1rem",
            border: "1px solid #ccc",
            padding: "1rem",
            borderRadius: "5px",
          }}
        >
          <h3>Product ID: {item.product_id}</h3>
          <p>
            <strong>Quantity:</strong> {item.quantity}
          </p>
          <button
            onClick={() => handleDelete(item.product_id)}
            style={{
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              borderRadius: "3px",
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default CartPage;
