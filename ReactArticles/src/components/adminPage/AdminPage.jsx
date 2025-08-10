// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import styles from "./adminPage.module.css";
// import AdminCategories from "./AdminCategories";
// import AdminProducts from "./AdminProducts";

// function AdminPage() {
//   const [categories, setCategories] = useState([]);
//   const [groupedProducts, setGroupedProducts] = useState([]);
//   const [allProducts, setAllProducts] = useState([]);
//   const [displayedProducts, setDisplayedProducts] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [message, setMessage] = useState({ text: "", type: "" });

//   // Filters
//   const [selectedColor, setSelectedColor] = useState("");
//   const [selectedSize, setSelectedSize] = useState("");
//   const [selectedId, setSelectedId] = useState(""); // <-- New ID filter state

//   // Mode handling
//   const [currentMode, setCurrentMode] = useState("grouped"); // "grouped" or "variants"
//   const [currentVariants, setCurrentVariants] = useState([]);

//   useEffect(() => {
//     fetchCategories();
//     fetchGroupedProducts();
//     fetchAllProducts();
//   }, []);

//   // <-- Add this useEffect to auto-clear messages after 5 seconds
//   useEffect(() => {
//     if (message.text) {
//       const timer = setTimeout(() => {
//         setMessage({ text: "", type: "" });
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [message]);

//   const fetchCategories = async () => {
//     try {
//       const res = await axios.get("http://localhost:8801/categories");
//       setCategories(res.data);
//     } catch {
//       setMessage({ text: "Failed to load categories", type: "error" });
//     }
//   };

//   const fetchGroupedProducts = async () => {
//     try {
//       const res = await axios.get("http://localhost:8801/products");
//       setGroupedProducts(res.data);
//       if (currentMode === "grouped") {
//         setDisplayedProducts(res.data);
//       }
//     } catch {
//       setMessage({ text: "Failed to load grouped products", type: "error" });
//     }
//   };

//   const fetchAllProducts = async () => {
//     try {
//       const res = await axios.get("http://localhost:8801/products/adminView");
//       setAllProducts(res.data);
//     } catch {
//       setMessage({ text: "Failed to load all products", type: "error" });
//     }
//   };

//   const handleCategorySelect = (category) => {
//     setSelectedCategory(category);
//     setCurrentMode("grouped");
//     const filtered = groupedProducts.filter(
//       (p) => String(p.category_id) === String(category.category_id)
//     );
//     setDisplayedProducts(filtered);
//   };

//   const handleShowVariants = (productId) => {
//     const variants = allProducts.filter(
//       (p) => String(p.id) === String(productId)
//     );
//     setCurrentVariants(variants);
//     setDisplayedProducts(variants);
//     setCurrentMode("variants");
//   };

//   const applyFilters = () => {
//     let productsToFilter;

//     if (currentMode === "variants") {
//       productsToFilter = currentVariants;
//     } else {
//       productsToFilter = groupedProducts;
//       if (selectedCategory) {
//         productsToFilter = productsToFilter.filter(
//           (p) => String(p.category_id) === String(selectedCategory.category_id)
//         );
//       }
//     }

//     if (selectedColor || selectedSize || selectedId) {
//       productsToFilter = productsToFilter.filter((item) => {
//         const colorMatch = selectedColor
//           ? item.color &&
//             item.color.toLowerCase() === selectedColor.toLowerCase()
//           : true;

//         const sizeMatch = selectedSize
//           ? item.size && item.size.toLowerCase() === selectedSize.toLowerCase()
//           : true;

//         const idMatch = selectedId
//           ? item.id && String(item.id).includes(selectedId)
//           : true;

//         return colorMatch && sizeMatch && idMatch;
//       });

//       if (currentMode === "grouped") {
//         productsToFilter = productsToFilter.filter((grouped) => {
//           const variants = allProducts.filter(
//             (variant) => String(variant.id) === String(grouped.id)
//           );

//           return variants.some((variant) => {
//             const colorMatch = selectedColor
//               ? variant.color &&
//                 variant.color.toLowerCase() === selectedColor.toLowerCase()
//               : true;

//             const sizeMatch = selectedSize
//               ? variant.size &&
//                 variant.size.toLowerCase() === selectedSize.toLowerCase()
//               : true;

//             const idMatch = selectedId
//               ? variant.id && String(variant.id).includes(selectedId)
//               : true;

//             return colorMatch && sizeMatch && idMatch;
//           });
//         });
//       }
//     }

//     setDisplayedProducts(productsToFilter);
//   };

//   useEffect(() => {
//     applyFilters();
//   }, [
//     selectedColor,
//     selectedSize,
//     selectedId,
//     selectedCategory,
//     groupedProducts,
//     currentVariants,
//   ]);

//   return (
//     <div className={styles.adminContainer}>
//       <div className={styles.header}>
//         <h1>Admin Dashboard</h1>
//         <p>Manage your categories and products</p>
//       </div>

//       {message.text && (
//         <div
//           className={
//             message.type === "error"
//               ? styles.errorMessage
//               : styles.successMessage
//           }
//           role="alert"
//         >
//           {message.text}
//         </div>
//       )}

//       {/* Filters */}
//       <div className={styles.filters}>
//         <label>
//           Color:
//           <input
//             type="text"
//             value={selectedColor}
//             onChange={(e) => setSelectedColor(e.target.value)}
//             placeholder="Enter color"
//           />
//         </label>

//         <label>
//           Size:
//           <input
//             type="text"
//             value={selectedSize}
//             onChange={(e) => setSelectedSize(e.target.value)}
//             placeholder="Enter size"
//           />
//         </label>

//         <label>
//           Id:
//           <input
//             type="text"
//             value={selectedId}
//             onChange={(e) => setSelectedId(e.target.value)}
//             placeholder="Enter ID"
//           />
//         </label>
//       </div>

//       <div className={styles.contentContainer}>
//         <AdminCategories
//           categories={categories}
//           selectedCategory={selectedCategory}
//           onSelect={handleCategorySelect}
//           onUpdateCategories={fetchCategories}
//           onShowMessage={setMessage}
//         />
//         <AdminProducts
//           products={displayedProducts}
//           selectedCategory={selectedCategory}
//           onRefresh={() => {
//             fetchGroupedProducts();
//             fetchAllProducts();
//           }}
//           onShowMessage={setMessage}
//           onShowVariants={handleShowVariants}
//         />
//       </div>
//     </div>
//   );
// }

// export default AdminPage;
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./adminPage.module.css";
import AdminCategories from "./AdminCategories";
import AdminProducts from "./AdminProducts";

function AdminPage() {
  const [categories, setCategories] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedId, setSelectedId] = useState("");

  const [currentMode, setCurrentMode] = useState("grouped");
  const [currentVariants, setCurrentVariants] = useState([]);

  // ✅ New: Pending orders
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchGroupedProducts();
    fetchAllProducts();
    fetchPendingOrders();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8801/categories");
      setCategories(res.data);
    } catch {
      setMessage({ text: "Failed to load categories", type: "error" });
    }
  };

  const fetchGroupedProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8801/products");
      setGroupedProducts(res.data);
      if (currentMode === "grouped") setDisplayedProducts(res.data);
    } catch {
      setMessage({ text: "Failed to load grouped products", type: "error" });
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8801/products/adminView");
      setAllProducts(res.data);
    } catch {
      setMessage({ text: "Failed to load all products", type: "error" });
    }
  };

  // ✅ New: Fetch pending orders
  const fetchPendingOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8801/orders/pending");
      setPendingOrders(res.data);
    } catch {
      setMessage({ text: "Failed to load pending orders", type: "error" });
    }
  };

  // ✅ New: Confirm order
  const handleConfirmOrder = async (orderId) => {
    try {
      await axios.put(`http://localhost:8801/orders/${orderId}/complete`);
      setMessage({
        text: `Order #${orderId} marked as completed`,
        type: "success",
      });
      fetchPendingOrders();
    } catch {
      setMessage({ text: "Failed to complete order", type: "error" });
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentMode("grouped");
    const filtered = groupedProducts.filter(
      (p) => String(p.category_id) === String(category.category_id)
    );
    setDisplayedProducts(filtered);
  };

  const handleShowVariants = (productId) => {
    const variants = allProducts.filter(
      (p) => String(p.id) === String(productId)
    );
    setCurrentVariants(variants);
    setDisplayedProducts(variants);
    setCurrentMode("variants");
  };

  const applyFilters = () => {
    let productsToFilter =
      currentMode === "variants" ? currentVariants : groupedProducts;

    if (selectedCategory && currentMode !== "variants") {
      productsToFilter = productsToFilter.filter(
        (p) => String(p.category_id) === String(selectedCategory.category_id)
      );
    }

    if (selectedColor || selectedSize || selectedId) {
      productsToFilter = productsToFilter.filter((item) => {
        const colorMatch = selectedColor
          ? item.color?.toLowerCase() === selectedColor.toLowerCase()
          : true;
        const sizeMatch = selectedSize
          ? item.size?.toLowerCase() === selectedSize.toLowerCase()
          : true;
        const idMatch = selectedId
          ? String(item.id).includes(selectedId)
          : true;
        return colorMatch && sizeMatch && idMatch;
      });
    }

    setDisplayedProducts(productsToFilter);
  };

  useEffect(() => {
    applyFilters();
  }, [
    selectedColor,
    selectedSize,
    selectedId,
    selectedCategory,
    groupedProducts,
    currentVariants,
  ]);

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Manage your categories, products & orders</p>
      </div>

      {message.text && (
        <div
          className={
            message.type === "error"
              ? styles.errorMessage
              : styles.successMessage
          }
        >
          {message.text}
        </div>
      )}

      {/* ✅ Pending Orders Section */}
      <div className={styles.pendingOrdersSection}>
        <h2>Pending Orders</h2>
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order) => (
                <tr key={order.order_id}>
                  <td>{order.order_id}</td>
                  <td>{order.email}</td>
                  <td>${order.total_amount}</td>
                  <td>{order.order_date}</td>
                  <td>
                    <button
                      onClick={() => handleConfirmOrder(order.order_id)}
                      className={styles.confirmButton}
                    >
                      Confirm
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <label>
          Color:
          <input
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            placeholder="Enter color"
          />
        </label>
        <label>
          Size:
          <input
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            placeholder="Enter size"
          />
        </label>
        <label>
          Id:
          <input
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            placeholder="Enter ID"
          />
        </label>
      </div>

      <div className={styles.contentContainer}>
        <AdminCategories
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={handleCategorySelect}
          onUpdateCategories={fetchCategories}
          onShowMessage={setMessage}
        />
        <AdminProducts
          products={displayedProducts}
          selectedCategory={selectedCategory}
          onRefresh={() => {
            fetchGroupedProducts();
            fetchAllProducts();
          }}
          onShowMessage={setMessage}
          onShowVariants={handleShowVariants}
        />
      </div>
    </div>
  );
}

export default AdminPage;
