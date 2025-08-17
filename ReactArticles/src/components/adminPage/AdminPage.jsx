// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import styles from "./adminPage.module.css";
// import AdminCategories from "./AdminCategories";
// import AdminProducts from "./AdminProducts";
// import AdminPending from "./AdminPending";
// import AdminAllOrders from "./AdminAllOrders"; // Orders with products
// import AdminOrderStats from "./AdminOrderStats"; // NEW COMPONENT

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

//   const [viewMode, setViewMode] = useState("pending"); // pending | allOrders | products | stats

//   useEffect(() => {
//     fetchCategories();
//     fetchGroupedProducts();
//     fetchAllProducts();
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
//         <div className={styles.navButtons}>
//           <button
//             className={
//               viewMode === "pending" ? styles.activeButton : styles.navButton
//             }
//             onClick={() => setViewMode("pending")}
//           >
//             Pending Orders
//           </button>
//           <button
//             className={
//               viewMode === "allOrders" ? styles.activeButton : styles.navButton
//             }
//             onClick={() => setViewMode("allOrders")}
//           >
//             All Orders
//           </button>
//           <button
//             className={
//               viewMode === "products" ? styles.activeButton : styles.navButton
//             }
//             onClick={() => setViewMode("products")}
//           >
//             Manage Products
//           </button>
//           <button
//             className={
//               viewMode === "stats" ? styles.activeButton : styles.navButton
//             }
//             onClick={() => setViewMode("stats")}
//           >
//             Order Statistics
//           </button>
//         </div>
//       </div>

//       {/* Views */}
//       {viewMode === "pending" && <AdminPending />}
//       {viewMode === "allOrders" && <AdminAllOrders />}
//       {viewMode === "products" && (
//         <>
//           {/* Filters */}
//           <div className={styles.filters}>
//             <label>
//               Color:
//               <input
//                 value={selectedColor}
//                 onChange={(e) => setSelectedColor(e.target.value)}
//                 placeholder="Enter color"
//               />
//             </label>
//             <label>
//               Size:
//               <input
//                 value={selectedSize}
//                 onChange={(e) => setSelectedSize(e.target.value)}
//                 placeholder="Enter size"
//               />
//             </label>
//             <label>
//               Id:
//               <input
//                 value={selectedId}
//                 onChange={(e) => setSelectedId(e.target.value)}
//                 placeholder="Enter ID"
//               />
//             </label>
//           </div>

//           <div className={styles.contentContainer}>
//             <AdminCategories
//               categories={categories}
//               selectedCategory={selectedCategory}
//               onSelect={handleCategorySelect}
//               onUpdateCategories={fetchCategories}
//               onShowMessage={setMessage}
//             />
//             <AdminProducts
//               products={displayedProducts}
//               selectedCategory={selectedCategory}
//               onRefresh={() => {
//                 fetchGroupedProducts();
//                 fetchAllProducts();
//               }}
//               onShowMessage={setMessage}
//               onShowVariants={handleShowVariants}
//             />
//           </div>
//         </>
//       )}
//       {viewMode === "stats" && <AdminOrderStats />}
//     </div>
//   );
// }

// export default AdminPage;
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./adminPage.module.css";
import AdminCategories from "./AdminCategories";
import AdminProducts from "./AdminProducts";
import AdminPending from "./AdminPending";
import AdminAllOrders from "./AdminAllOrders"; // Orders with products
import AdminOrderStats from "./AdminOrderStats"; // Stats component
import AdminAllUsers from "./AdminAllUsers"; // NEW COMPONENT

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

  const [viewMode, setViewMode] = useState("pending"); // pending | allOrders | products | stats | users

  useEffect(() => {
    fetchCategories();
    fetchGroupedProducts();
    fetchAllProducts();
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
        <div className={styles.navButtons}>
          <button
            className={
              viewMode === "pending" ? styles.activeButton : styles.navButton
            }
            onClick={() => setViewMode("pending")}
          >
            Pending Orders
          </button>
          <button
            className={
              viewMode === "allOrders" ? styles.activeButton : styles.navButton
            }
            onClick={() => setViewMode("allOrders")}
          >
            All Orders
          </button>
          <button
            className={
              viewMode === "products" ? styles.activeButton : styles.navButton
            }
            onClick={() => setViewMode("products")}
          >
            Manage Products
          </button>
          <button
            className={
              viewMode === "stats" ? styles.activeButton : styles.navButton
            }
            onClick={() => setViewMode("stats")}
          >
            Order Statistics
          </button>
          <button
            className={
              viewMode === "users" ? styles.activeButton : styles.navButton
            }
            onClick={() => setViewMode("users")}
          >
            All Users
          </button>
        </div>
      </div>

      {/* Views */}
      {viewMode === "pending" && <AdminPending />}
      {viewMode === "allOrders" && <AdminAllOrders />}
      {viewMode === "products" && (
        <>
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
        </>
      )}
      {viewMode === "stats" && <AdminOrderStats />}
      {viewMode === "users" && <AdminAllUsers />}
    </div>
  );
}

export default AdminPage;
