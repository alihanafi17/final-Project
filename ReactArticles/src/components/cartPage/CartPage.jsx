// import React from "react";
// import { useLocation } from "react-router-dom";

// function CartPage() {
//   const location = useLocation();
//   const { product, quantity } = location.state || {};
//   console.log(product);

//   if (!product) {
//     return (
//       <div style={{ padding: "2rem" }}>
//         <h2>Your Cart</h2>
//         <p>No product added to cart yet.</p>
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: "2rem" }}>
//       <h2>Your Cart</h2>
//       <div>
//         <h3>{product.name}</h3>
//         <p>
//           <strong>Size:</strong> {product.size}
//         </p>
//         <p>
//           <strong>Color:</strong> {product.color}
//         </p>
//         <p>
//           <strong>Price:</strong> ${product.price}
//         </p>
//         <p>
//           <strong>Quantity:</strong> {quantity}
//         </p>
//         <p>
//           <strong>Total:</strong> ${(product.price * quantity).toFixed(2)}
//         </p>
//       </div>
//     </div>
//   );
// }

// export default CartPage;
import React, { useEffect, useState } from "react";
import axios from "axios";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!email) {
      setError("You must be logged in to view the cart.");
      setLoading(false);
      return;
    }

    fetchCartItems();
  }, [email]);

  const fetchCartItems = () => {
    axios
      .get(`http://localhost:8801/cart/${email}`)
      .then((res) => {
        setCartItems(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch cart:", err);
        setError("Failed to load cart.");
        setLoading(false);
      });
  };

  const handleDelete = (product_id) => {
    axios
      .delete(`http://localhost:8801/cart/${email}/${product_id}`)
      .then(() => {
        // Remove deleted item from local state for instant UI update
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
