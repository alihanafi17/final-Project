import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./adminPage.module.css";

function AdminProducts({
  products,
  selectedCategory,
  onRefresh,
  onShowMessage,
  message,
}) {
  const [formVisible, setFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_id: "",
    id: "",
    name: "",
    description: "",
    size: "",
    color: "",
    price: "",
    quantity: "",
    image: null,
  });

  const [variantProducts, setVariantProducts] = useState(null);

  // Auto-clear message after 5 seconds when message changes
  useEffect(() => {
    if (message?.text) {
      const timer = setTimeout(() => {
        onShowMessage({ text: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onShowMessage]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      product_id: product.product_id || "",
      id: product.id || "",
      name: product.name || "",
      description: product.description || "",
      size: product.size || "",
      color: product.color || "",
      price: product.price || "",
      quantity: product.quantity || "",
      image: null,
    });
    setFormVisible(true);
  };

  const handleDelete = (product_id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return; // User cancelled delete
    }
    axios
      .delete(`http://localhost:8801/products/${product_id}`)
      .then(() => {
        onShowMessage({ text: "Product deleted", type: "success" });
        onRefresh();
        setVariantProducts(null);
      })
      .catch(() => onShowMessage({ text: "Delete failed", type: "error" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries({
      ...formData,
      ...(selectedCategory
        ? { category_id: selectedCategory.category_id }
        : {}),
    }).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        payload.append(k, v);
      }
    });

    const request = editingProduct
      ? axios.put(
          `http://localhost:8801/products/${editingProduct.product_id}`,
          payload
        )
      : axios.post("http://localhost:8801/products", payload);

    request
      .then(() => {
        onShowMessage({
          text: editingProduct ? "Product updated" : "Product added",
          type: "success",
        });
        setFormVisible(false);
        setEditingProduct(null);
        onRefresh();
        setVariantProducts(null);
      })
      .catch(() => onShowMessage({ text: "Save failed", type: "error" }));
  };

  const handleShowVariants = async (product) => {
    try {
      const res = await axios.get("http://localhost:8801/products/adminView");
      const allProducts = res.data;
      const variants = allProducts.filter(
        (p) => String(p.id) === String(product.id)
      );
      setVariantProducts(variants);
    } catch {
      onShowMessage({ text: "Failed to load variants", type: "error" });
    }
  };

  const handleBackToProducts = () => {
    setVariantProducts(null);
  };

  return (
    <main className={styles.mainContent}>
      <div className={styles.categoryHeader}>
        <h2>
          {selectedCategory ? selectedCategory.category_name : "All Products"}
        </h2>
        {selectedCategory && !formVisible && (
          <button
            className={styles.addProductButton}
            onClick={() => {
              setEditingProduct(null);
              setFormVisible(true);
              setFormData({
                product_id: "",
                id: "",
                name: "",
                description: "",
                size: "",
                color: "",
                price: "",
                quantity: "",
                image: null,
              });
              setVariantProducts(null);
            }}
          >
            + Add Product
          </button>
        )}
      </div>

      {formVisible && (
        <form
          className={styles.formContainer}
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Id:</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                required={!editingProduct}
                disabled={editingProduct}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={!editingProduct}
                disabled={editingProduct}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Size:</label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                required={!editingProduct}
                disabled={editingProduct}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Color:</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                required={!editingProduct}
                disabled={editingProduct}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Price:</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Quantity:</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Image:</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitButton}>
              {editingProduct ? "Update" : "Add"}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setFormVisible(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!formVisible && variantProducts ? (
        <>
          <button
            className={styles.backButton}
            onClick={handleBackToProducts}
            style={{ marginBottom: "1rem" }}
          >
            &larr; Back to products
          </button>
          <h3>Variants for Id: {variantProducts[0]?.id}</h3>
          <div className={styles.productsGrid}>
            {variantProducts.map((product) => (
              <div key={product.product_id} className={styles.productCard}>
                <h3>{product.name}</h3>
                <p className={styles.productDescription}>
                  {product.description}
                </p>
                <div className={styles.productDetails}>
                  <p>
                    <strong>Size:</strong> {product.size}
                  </p>
                  <p>
                    <strong>Color:</strong> {product.color}
                  </p>
                  <p>
                    <strong>Price:</strong> ${Number(product.price).toFixed(2)}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {product.quantity}
                  </p>
                </div>
                <div className={styles.productActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(product)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(product.product_id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        !formVisible && (
          <div className={styles.productsGrid}>
            {products.length === 0 ? (
              <p className={styles.noProducts}>No products found.</p>
            ) : (
              products.map((product) => (
                <div key={product.product_id} className={styles.productCard}>
                  <h3>{product.name}</h3>
                  <h3>Id: {product.id}</h3>
                  <div className={styles.productDetails}></div>
                  <div className={styles.productActions}>
                    {/* <button
                      className={styles.editButton}
                      onClick={() => handleEdit(product)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(product.product_id)}
                      type="button"
                    >
                      Delete
                    </button> */}
                    <button
                      className={styles.variantButton}
                      onClick={() => handleShowVariants(product)}
                      type="button"
                      title="Show all variants of this product"
                      style={{ marginLeft: "8px" }}
                    >
                      Show Variants
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )
      )}
    </main>
  );
}

export default AdminProducts;
