import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../adminPage/adminPage.module.css";
import axios from "axios";

function ProductAdmin() {
  const location = useLocation();
  const { filteredProds, selectedCategory } = location.state || {};
  const [localFilteredProds, setLocalFilteredProds] = useState(
    filteredProds || []
  );

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

  const resetProductForm = () => {
    setProductForm({
      id: "",
      name: "",
      description: "",
      size: "",
      color: "",
      price: "",
      quantity: "",
      category_id: selectedCategory ? selectedCategory.category_id : "",
    });
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      "id",
      "name",
      "description",
      "size",
      "color",
      "price",
      "quantity",
    ];
    const emptyFields = requiredFields.filter(
      (field) =>
        !productForm[field] || productForm[field].toString().trim() === ""
    );

    if (emptyFields.length > 0) {
      const fieldLabels = {
        id: "Product ID",
        name: "Product Name",
        description: "Description",
        size: "Size",
        color: "Color",
        price: "Price",
        quantity: "Quantity",
      };
      const missingFieldsLabels = emptyFields.map(
        (field) => fieldLabels[field] || field
      );
      setErrorMessage(
        `Product not added: Missing required fields - ${missingFieldsLabels.join(
          ", "
        )}`
      );
      return;
    }

    if (editingProduct) {
      axios
        .put(
          `http://localhost:8801/products/${editingProduct.product_id}`,
          productForm
        )
        .then(() => {
          fetchProductsByCategory(selectedCategory.category_id);
          fetchAllProducts();
          setShowAddProduct(false);
          setEditingProduct(null);
          resetProductForm();
          setSuccessMessage("Product updated successfully!");
        })
        .catch((error) => {
          console.error("Error updating product:", error);
          if (error.response) {
            if (error.response.status === 400) {
              setErrorMessage(
                `Product not updated: Bad request - ${
                  error.response.data.message || "Invalid data format"
                }`
              );
            } else if (error.response.status === 404) {
              setErrorMessage(
                `Product not updated: Product ID ${editingProduct.product_id} not found in database`
              );
            } else if (error.response.status === 500) {
              setErrorMessage(
                `Product not updated: Server error - Please try again later`
              );
            } else {
              setErrorMessage(
                `Product not updated: ${
                  error.response.data.message || "Unknown server error"
                }`
              );
            }
          } else if (error.request) {
            setErrorMessage(
              `Product not updated: No response from server - Check your connection`
            );
          } else {
            setErrorMessage(
              `Product not updated: ${
                error.message || "Unknown error occurred"
              }`
            );
          }
        });
    } else {
      const productExists = allProducts.some(
        (product) => product.id === productForm.id
      );
      if (productExists) {
        const existingProduct = allProducts.find(
          (product) => product.id === productForm.id
        );
        setErrorMessage(
          `Product not added: ID ${productForm.id} already exists (${
            existingProduct?.name || "Unknown product"
          })`
        );
        return;
      }
    }
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      axios
        .delete(`http://localhost:8801/products/${productId}`)
        .then(() => {
          fetchProductsByCategory(selectedCategory.category_id);
          fetchAllProducts();
          setLocalFilteredProds((prev) =>
            prev.filter((product) => product.product_id !== productId)
          );
          setSuccessMessage("Product deleted successfully!");
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
          if (error.response) {
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
            setErrorMessage(
              `Product not deleted: No response from server - Check your connection`
            );
          } else {
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
    setErrorMessage("");
    setSuccessMessage("");
  }, [selectedCategory]);

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
      .then((res) => setAllProducts(res.data))
      .catch((error) => console.error("Error fetching all products:", error));
  };

  const fetchProductsByCategory = (categoryId) => {
    axios
      .get(`http://localhost:8801/products`)
      .then((res) => {
        const filtered = res.data.filter(
          (product) => product.category_id === categoryId
        );
        setProducts(filtered);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setErrorMessage("Failed to load products. Please try again.");
      });
  };

  return (
    <div>
      <button className={styles.editButton} onClick={() => navigate(-1)}>
        Back
      </button>

      {localFilteredProds && localFilteredProds.length > 0 ? (
        <div className={styles.productsGrid}>
          {localFilteredProds.map((product) => (
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