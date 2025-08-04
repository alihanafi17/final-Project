import styles from "../adminPage/adminPage.module.css";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function ProductForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedProduct = location.state?.product || {};
  const fetchAllProducts = location.state?.fetchAllProducts;

  const [productForm, setProductForm] = useState({
    product_id: passedProduct.product_id || "",
    name: passedProduct.name || "",
    description: passedProduct.description || "",
    size: passedProduct.size || "",
    color: passedProduct.color || "",
    price: passedProduct.price || "",
    quantity: passedProduct.quantity || "",
    category_id: passedProduct.category_id || "",
    image: null, // will hold the file object
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setProductForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setProductForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(productForm).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, value);
      }
    });

    axios
      .put(
        `http://localhost:8801/products/${productForm.product_id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((res) => {
        console.log("Product updated successfully:", res.data);
        alert("Product updated successfully");
        navigate("/adminPage");
      })
      .catch((err) => {
        console.error("Failed to update product:", err);
      });
  };

  return (
    <div className={styles.formContainer}>
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Product ID:</label>
            <input
              type="text"
              name="product_id"
              value={productForm.product_id}
              onChange={handleInputChange}
              disabled
            />
          </div>
          <div className={styles.formGroup}>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={productForm.name}
              onChange={handleInputChange}
              disabled
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Description:</label>
          <textarea
            name="description"
            value={productForm.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Size:</label>
            <input
              type="text"
              name="size"
              value={productForm.size}
              onChange={handleInputChange}
              disabled
            />
          </div>
          <div className={styles.formGroup}>
            <label>Color:</label>
            <input
              type="text"
              name="color"
              value={productForm.color}
              onChange={handleInputChange}
              disabled
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Price:</label>
            <input
              type="number"
              name="price"
              value={productForm.price}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={productForm.quantity}
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
            {productForm.image && typeof productForm.image === "object" && (
              <p>Selected file: {productForm.image.name}</p>
            )}
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            Update Product
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
