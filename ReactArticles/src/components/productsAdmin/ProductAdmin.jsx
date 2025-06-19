import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../adminPage/adminPage.module.css";
import axios from "axios";
import { useLocation } from "react-router-dom";

function ProductAdmin() {
  const location = useLocation();
  const { filteredProds, selectedCategory } = location.state || {};
  console.log(filteredProds);
  const [productForm, setProductForm] = useState({
    id: "",
    name: "",
    description: "",
    size: "",
    color: "",
    price: "",
    quantity: "",
    category_id: "",
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const handleEditProductClick = (product) => {
    setProductForm({
      id: product.id || "",
      name: product.name || "",
      description: product.description || "",
      size: product.size || "",
      color: product.color || "",
      price: product.price || "",
      quantity: product.quantity || "",
      category_id: product.category_id || "",
    });
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      axios
        .delete(`http://localhost:8801/products/${productId}`)
        .then(() => {
          fetchProductsByCategory(selectedCategory.category_id);
          fetchAllProducts(); // Update all products list
          setSuccessMessage("Product deleted successfully!");
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
          if (error.response) {
            // Server responded with an error status code
            if (error.response.status === 404) {
              setErrorMessage(
                `Product not deleted: Product ID ${productId} not found in database`
              );
            } else if (error.response.status === 500) {
              setErrorMessage(
                `Product not deleted: Server error - Please try again later`
              );
            } else {
              setErrorMessage(
                `Product not deleted: ${
                  error.response.data?.message || "Unknown server error"
                }`
              );
            }
          } else if (error.request) {
            // Request was made but no response received
            setErrorMessage(
              `Product not deleted: No response from server - Check your connection`
            );
          } else {
            // Error in setting up the request
            setErrorMessage(
              `Product not deleted: ${
                error.message || "Unknown error occurred"
              }`
            );
          }
        });
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory.category_id);
    }
    // Clear messages when category changes
    setErrorMessage("");
    setSuccessMessage("");
  }, [selectedCategory]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
        setSuccessMessage("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  const fetchAllProducts = () => {
    axios
      .get(`http://localhost:8801/products/adminView`)
      .then((res) => {
        setAllProducts(res.data);
      })
      .catch((error) => {
        console.error("Error fetching all products:", error);
      });
  };

  const fetchProductsByCategory = (categoryId) => {
    axios
      .get(`http://localhost:8801/products`)
      .then((res) => {
        // Filter products by category_id
        const filteredProducts = res.data.filter(
          (product) => product.category_id === categoryId
        );
        setProducts(filteredProducts);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setErrorMessage("Failed to load products. Please try again.");
      });
  };

  return (
    <div>
      <button onClick={() => navigate(-1)}>
        ⬅ Back to Category
      </button>

      {filteredProds && filteredProds.length > 0 ? (
        <div className={styles.productsGrid}>
          {filteredProds.map((product) => (
            <div key={product.product_id} className={styles.productCard}>
              <h3>{product.name}</h3>
              <p className={styles.productDescription}>{product.description}</p>
              <div className={styles.productDetails}>
                <p>
                  <strong>id:</strong> {product.product_id}
                </p>
                <p>
                  <strong>Size:</strong> {product.size}
                </p>
                <p>
                  <strong>Color:</strong> {product.color}
                </p>
                <p>
                  <strong>Price:</strong> ${product.price}
                </p>
                <p>
                  <strong>Quantity:</strong> {product.quantity}
                </p>
              </div>
              <div className={styles.productActions}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEditProductClick(product)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteProduct(product.product_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noProducts}>No products found in this category.</p>
      )}
    </div>
  );
}

export default ProductAdmin;
