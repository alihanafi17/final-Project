import React from "react";
import axios from "axios";
import styles from "./adminPage.module.css";

function AdminCategories({
  categories,
  selectedCategory,
  onSelect,
  onUpdateCategories,
  onShowMessage,
}) {
  const handleDelete = (category_id) => {
    axios
      .delete(`http://localhost:8801/categories/${category_id}`)
      .then(() => {
        onShowMessage({ text: "Category deleted", type: "success" });
        if (selectedCategory?.category_id === category_id) onSelect(null);
        onUpdateCategories();
      })
      .catch(() => {
        onShowMessage({ text: "Error deleting category", type: "error" });
      });
  };

  return (
    <aside className={styles.categorySidebar}>
      <h2>Categories</h2>
      <div className={styles.categoryList}>
        {categories.map((cat) => (
          <div key={cat.category_id} className={styles.categoryItem}>
            <button
              className={`${styles.categoryButton} ${
                selectedCategory?.category_id === cat.category_id
                  ? styles.active
                  : ""
              }`}
              onClick={() => onSelect(cat)}
              type="button"
            >
              {cat.category_name}
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => handleDelete(cat.category_id)}
              title="Delete category"
            >
              ×
            </button>
          </div>
        ))}

        {categories.length === 0 && <p>No categories found.</p>}
      </div>
    </aside>
  );
}

export default AdminCategories;
