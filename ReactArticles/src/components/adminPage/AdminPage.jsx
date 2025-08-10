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

  useEffect(() => {
    fetchCategories();
    fetchGroupedProducts();
    fetchAllProducts();
  }, []);

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
    } catch {
      setMessage({ text: "Failed to load grouped products", type: "error" });
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8801/products/adminView");
      setAllProducts(res.data);
      // Initially show all grouped products
      setDisplayedProducts(groupedProducts.length ? groupedProducts : res.data);
    } catch {
      setMessage({ text: "Failed to load all products", type: "error" });
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const filtered = groupedProducts.filter(
      (p) => String(p.category_id) === String(category.category_id)
    );
    setDisplayedProducts(filtered);
  };

  const handleShowVariants = (productId) => {
    const variants = allProducts.filter(
      (p) => String(p.id) === String(productId)
    );
    setDisplayedProducts(variants);
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Manage your categories and products</p>
      </div>

      {message.text && (
        <div
          className={
            message.type === "error"
              ? styles.errorMessage
              : styles.successMessage
          }
          role="alert"
        >
          {message.text}
        </div>
      )}

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
