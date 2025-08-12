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

//   const [selectedColor, setSelectedColor] = useState("");
//   const [selectedSize, setSelectedSize] = useState("");
//   const [selectedId, setSelectedId] = useState("");

//   const [currentMode, setCurrentMode] = useState("grouped");
//   const [currentVariants, setCurrentVariants] = useState([]);

//   // Pending orders state
//   const [pendingOrders, setPendingOrders] = useState([]);

//   // Modal states for order details
//   const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
//   const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

//   useEffect(() => {
//     fetchCategories();
//     fetchGroupedProducts();
//     fetchAllProducts();
//     fetchPendingOrders();
//   }, []);

//   useEffect(() => {
//     if (message.text) {
//       const timer = setTimeout(() => setMessage({ text: "", type: "" }), 3000);
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
//       if (currentMode === "grouped") setDisplayedProducts(res.data);
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

//   const fetchPendingOrders = async () => {
//     try {
//       const res = await axios.get("http://localhost:8801/orders/pending");
//       setPendingOrders(res.data);
//     } catch {
//       setMessage({ text: "Failed to load pending orders", type: "error" });
//     }
//   };

//   // Confirm order handler
//   const handleConfirmOrder = async (orderId) => {
//     try {
//       await axios.put(`http://localhost:8801/orders/${orderId}/complete`);
//       setMessage({
//         text: `Order #${orderId} marked as completed`,
//         type: "success",
//       });
//       fetchPendingOrders();
//     } catch {
//       setMessage({ text: "Failed to complete order", type: "error" });
//     }
//   };

//   // Show order details popup modal
//   const handleViewOrderDetails = async (orderId) => {
//     try {
//       const res = await axios.get(
//         `http://localhost:8801/orders/${orderId}/details`
//       );
//       setSelectedOrderDetails(res.data);
//       setShowOrderDetailsModal(true);
//     } catch (err) {
//       console.error("Failed to fetch order details:", err);
//       setMessage({ text: "Failed to load order details", type: "error" });
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
//     let productsToFilter =
//       currentMode === "variants" ? currentVariants : groupedProducts;

//     if (selectedCategory && currentMode !== "variants") {
//       productsToFilter = productsToFilter.filter(
//         (p) => String(p.category_id) === String(selectedCategory.category_id)
//       );
//     }

//     if (selectedColor || selectedSize || selectedId) {
//       productsToFilter = productsToFilter.filter((item) => {
//         const colorMatch = selectedColor
//           ? item.color?.toLowerCase() === selectedColor.toLowerCase()
//           : true;
//         const sizeMatch = selectedSize
//           ? item.size?.toLowerCase() === selectedSize.toLowerCase()
//           : true;
//         const idMatch = selectedId
//           ? String(item.id).includes(selectedId)
//           : true;
//         return colorMatch && sizeMatch && idMatch;
//       });
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
//         <p>Manage your categories, products & orders</p>
//       </div>

//       {message.text && (
//         <div
//           className={
//             message.type === "error"
//               ? styles.errorMessage
//               : styles.successMessage
//           }
//         >
//           {message.text}
//         </div>
//       )}

//       {/* Pending Orders Section */}
//       <div className={styles.pendingOrdersSection}>
//         <h2>Pending Orders</h2>
//         {pendingOrders.length === 0 ? (
//           <p>No pending orders</p>
//         ) : (
//           <table className={styles.ordersTable}>
//             <thead>
//               <tr>
//                 <th>Order ID</th>
//                 <th>Email</th>
//                 <th>Total Amount</th>
//                 <th>Date</th>
//                 <th>Time</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {pendingOrders.map((order) => (
//                 <tr key={order.order_id}>
//                   <td>{order.order_id}</td>
//                   <td>{order.email}</td>
//                   <td>${Number(order.total_amount).toFixed(2)}</td>
//                   <td>{new Date(order.order_date).toLocaleDateString()}</td>
//                   <td>{order.order_time}</td>
//                   <td>
//                     <button
//                       onClick={() => handleConfirmOrder(order.order_id)}
//                       className={styles.confirmButton}
//                       style={{ marginRight: "8px" }}
//                     >
//                       Confirm
//                     </button>
//                     <button
//                       onClick={() => handleViewOrderDetails(order.order_id)}
//                       className={styles.detailsButton}
//                     >
//                       View Details
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Filters */}
//       <div className={styles.filters}>
//         <label>
//           Color:
//           <input
//             value={selectedColor}
//             onChange={(e) => setSelectedColor(e.target.value)}
//             placeholder="Enter color"
//           />
//         </label>
//         <label>
//           Size:
//           <input
//             value={selectedSize}
//             onChange={(e) => setSelectedSize(e.target.value)}
//             placeholder="Enter size"
//           />
//         </label>
//         <label>
//           Id:
//           <input
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

//       {/* Order Details Modal Popup */}
//       {showOrderDetailsModal && selectedOrderDetails && (
//         <div
//           className={styles.modalOverlay}
//           onClick={() => setShowOrderDetailsModal(false)}
//           role="dialog"
//           aria-modal="true"
//           aria-labelledby="modal-title"
//         >
//           <div
//             className={styles.modalContent}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button
//               className={styles.closeModalButton}
//               onClick={() => setShowOrderDetailsModal(false)}
//               aria-label="Close modal"
//             >
//               ×
//             </button>
//             <h3 id="modal-title">
//               Order Details - #{selectedOrderDetails.order.order_id}
//             </h3>
//             <p>
//               <strong>Email:</strong> {selectedOrderDetails.order.email}
//             </p>
//             <p>
//               <strong>Date:</strong>{" "}
//               {new Date(
//                 selectedOrderDetails.order.order_date
//               ).toLocaleDateString()}
//             </p>
//             <p>
//               <strong>Time:</strong> {selectedOrderDetails.order.order_time}
//             </p>

//             <table className={styles.detailsTable}>
//               <thead>
//                 <tr>
//                   <th>Product ID</th>
//                   <th>Name</th>
//                   <th>Quantity</th>
//                   <th>Unit Price</th>
//                   <th>Subtotal</th>
//                   <th>Color</th>
//                   <th>Size</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {selectedOrderDetails.products.map((prod) => (
//                   <tr key={prod.product_id}>
//                     <td>{prod.product_id}</td>
//                     <td>{prod.product_name}</td>
//                     <td>{prod.quantity}</td>
//                     <td>${Number(prod.unit_price ?? 0).toFixed(2)}</td>
//                     <td>${Number(prod.subtotal ?? 0).toFixed(2)}</td>
//                     <td>{prod.color}</td>
//                     <td>{prod.size}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
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

  // Pending orders state
  const [pendingOrders, setPendingOrders] = useState([]);

  // Modal states for order details
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Reject modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingOrderId, setRejectingOrderId] = useState(null);

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

  const fetchPendingOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8801/orders/pending");
      setPendingOrders(res.data);
    } catch {
      setMessage({ text: "Failed to load pending orders", type: "error" });
    }
  };

  // Confirm order handler
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

  // Show order details popup modal
  const handleViewOrderDetails = async (orderId) => {
    try {
      const res = await axios.get(
        `http://localhost:8801/orders/${orderId}/details`
      );
      setSelectedOrderDetails(res.data);
      setShowOrderDetailsModal(true);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      setMessage({ text: "Failed to load order details", type: "error" });
    }
  };

  // Open reject modal
  const handleOpenRejectModal = (orderId) => {
    setRejectReason("");
    setRejectingOrderId(orderId);
    setShowRejectModal(true);
  };

  // Submit reject reason & notify user
  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }
    try {
      await axios.put(
        `http://localhost:8801/orders/${rejectingOrderId}/reject`,
        { rejectionReason: rejectReason }
      );
      setMessage({
        text: `Order #${rejectingOrderId} rejected and user notified.`,
        type: "success",
      });
      setShowRejectModal(false);
      setRejectReason("");
      setRejectingOrderId(null);
      fetchPendingOrders();
    } catch (err) {
      console.error("Failed to reject order:", err);
      setMessage({ text: "Failed to reject order", type: "error" });
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

      {/* Pending Orders Section */}
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

      {/* Order Details Modal Popup */}
      {showOrderDetailsModal && selectedOrderDetails && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowOrderDetailsModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeModalButton}
              onClick={() => setShowOrderDetailsModal(false)}
              aria-label="Close modal"
            >
              ×
            </button>
            <h3 id="modal-title">
              Order Details - #{selectedOrderDetails.order.order_id}
            </h3>
            <p>
              <strong>Email:</strong> {selectedOrderDetails.order.email}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(
                selectedOrderDetails.order.order_date
              ).toLocaleDateString()}
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

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowRejectModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeModalButton}
              onClick={() => setShowRejectModal(false)}
              aria-label="Close reject modal"
            >
              ×
            </button>
            <h3 id="reject-modal-title">Reject Order #{rejectingOrderId}</h3>
            <label htmlFor="rejectReason">
              Please enter the reason for rejection:
            </label>
            <textarea
              id="rejectReason"
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

export default AdminPage;
