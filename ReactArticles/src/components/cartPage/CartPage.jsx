import React, { useEffect, useState } from "react";
import axios from "axios";
import { checkAuth } from "../../auth";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(null);

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

  const totalPrice = cartItems.reduce((sum, item) => {
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    if (isNaN(price) || isNaN(quantity)) return sum;
    return sum + price * quantity;
  }, 0);

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
          <h3>{item.name || `Product ID: ${item.product_id}`}</h3>
          <p>
            <strong>Size:</strong> {item.size}
          </p>
          <p>
            <strong>Color:</strong> {item.color}
          </p>
          <p>
            <strong>Quantity:</strong> {item.quantity}
          </p>
          <p>
            <strong>Price per item:</strong> ${Number(item.price).toFixed(2)}
          </p>
          <p>
            <strong>Subtotal:</strong> $
            {(item.price * item.quantity).toFixed(2)}
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

      <hr />
      <h3>Total Price: ${totalPrice.toFixed(2)}</h3>

      <div style={{ marginTop: "2rem" }}>
        <PayPalScriptProvider
          options={{
            "client-id":
              "ASWJzRBNnnkZOUQpFSMBa9TrMo24D9FV7HpbCtlIXysgMt2L-I9z0N6bfEDUHbNnFHwkmuz7HmBVI7O2",
          }}
        >
          <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: totalPrice.toFixed(2),
                    },
                  },
                ],
              });
            }}
            onApprove={(data, actions) => {
              return actions.order.capture().then(async (details) => {
                alert(
                  `Transaction completed by ${details.payer.name.given_name}`
                );

                try {
                  // Save order
                  await axios.post("http://localhost:8801/orders", {
                    total_amount: totalPrice,
                    email,
                  });

                  // ✅ Update inventory
                  await axios.post(
                    "http://localhost:8801/products/update-quantities",
                    {
                      products: cartItems.map((item) => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                      })),
                    }
                  );

                  // Clear cart
                  await axios.delete(`http://localhost:8801/cart/${email}/all`);
                  setCartItems([]);
                  alert("Order placed and cart cleared!");
                } catch (err) {
                  console.error("Order processing error:", err);
                  alert("Failed to process order. Please contact support.");
                }
              });
            }}
            onError={(err) => {
              console.error("PayPal Checkout Error:", err);
              alert("Payment failed. Please try again.");
            }}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
}

export default CartPage;
