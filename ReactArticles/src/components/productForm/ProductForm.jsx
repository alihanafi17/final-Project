import styles from "../adminPage/adminPage.module.css";
import React, { useState, useEffect } from "react";
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
  });

  const handleInputChange = (e, formSetter, formState) => {
    const { name, value } = e.target;
    formSetter({
      ...formState,
      [name]: value,
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault(); // prevent page reload

    axios
      .put(
        `http://localhost:8801/products/${productForm.product_id}`,
        productForm
      )
      .then((res) => {
        console.log("Product updated successfully:", res.data);
        alert("Product updated successfully");
        navigate("/adminPage"); // go back after saving
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
              name="id"
              value={productForm.product_id}
              onChange={(e) =>
                handleInputChange(e, setProductForm, productForm)
              }
              disabled
            />
          </div>
          <div className={styles.formGroup}>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={productForm.name}
              onChange={(e) =>
                handleInputChange(e, setProductForm, productForm)
              }
              disabled
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Description:</label>
          <textarea
            name="description"
            value={productForm.description}
            onChange={(e) => handleInputChange(e, setProductForm, productForm)}
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
              onChange={(e) =>
                handleInputChange(e, setProductForm, productForm)
              }
              disabled
            />
          </div>
          <div className={styles.formGroup}>
            <label>Color:</label>
            <input
              type="text"
              name="color"
              value={productForm.color}
              onChange={(e) =>
                handleInputChange(e, setProductForm, productForm)
              }
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
              onChange={(e) =>
                handleInputChange(e, setProductForm, productForm)
              }
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={productForm.quantity}
              onChange={(e) =>
                handleInputChange(e, setProductForm, productForm)
              }
              required
            />
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
