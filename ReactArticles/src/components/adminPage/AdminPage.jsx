// import React, { useState, useEffect } from "react";
// import { useAuth } from "../AuthContext";
// import { Navigate } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import styles from "./adminPage.module.css";

// function AdminPage() {
//   const { user } = useAuth();
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [showAddCategory, setShowAddCategory] = useState(false);
//   const [showAddProduct, setShowAddProduct] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [allProducts, setAllProducts] = useState([]);
//   const [allProd, setAllProd] = useState([]);
//   const navigate = useNavigate();

//   // Form states
//   const [newCategory, setNewCategory] = useState({ name: "", number: "" });
//   const [productForm, setProductForm] = useState({
//     id: "",
//     name: "",
//     description: "",
//     size: "",
//     color: "",
//     price: "",
//     quantity: "",
//     category_id: "",
//   });

//   // Fetch categories and all products on component mount
//   useEffect(() => {
//     fetchCategories();
//     fetchAllProducts();
//   }, []);

//   // Fetch products when a category is selected
//   useEffect(() => {
//     if (selectedCategory) {
//       fetchProductsByCategory(selectedCategory.category_id);
//     }
//     // Clear messages when category changes
//     setErrorMessage("");
//     setSuccessMessage("");
//   }, [selectedCategory]);

//   // Clear messages after 5 seconds
//   useEffect(() => {
//     if (errorMessage || successMessage) {
//       const timer = setTimeout(() => {
//         setErrorMessage("");
//         setSuccessMessage("");
//       }, 5000);

//       return () => clearTimeout(timer);
//     }
//   }, [errorMessage, successMessage]);

//   const fetchCategories = () => {
//     axios
//       .get("http://localhost:8801/categories")
//       .then((res) => {
//         setCategories(res.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching categories:", error);
//       });
//   };

//   const fetchAllProducts = () => {
//     axios
//       .get(`http://localhost:8801/products`)
//       .then((res) => {
//         setAllProducts(res.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching all products:", error);
//       });
//   };

//   const fetchAllProd = () => {
//     axios
//       .get(`http://localhost:8801/products/adminView`)
//       .then((res) => {
//         setAllProd(res.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching all products:", error);
//       });
//   };

//   const fetchProductsByCategory = (categoryId) => {
//     axios
//       .get(`http://localhost:8801/products`)
//       .then((res) => {
//         // Filter products by category_id
//         const filteredProducts = res.data.filter(
//           (product) => product.category_id === categoryId
//         );
//         setProducts(filteredProducts);
//       })
//       .catch((error) => {
//         console.error("Error fetching products:", error);
//         setErrorMessage("Failed to load products. Please try again.");
//       });
//   };

//   const handleCategoryClick = (category) => {
//     setSelectedCategory(category);
//   };

//   const handleDeleteCategory = (categoryId) => {
//     if (
//       window.confirm(
//         "Are you sure you want to delete this category? All products in this category will also be deleted."
//       )
//     ) {
//       axios
//         .delete(`http://localhost:8801/categories/${categoryId}`)
//         .then(() => {
//           fetchCategories();
//           if (selectedCategory && selectedCategory.category_id === categoryId) {
//             setSelectedCategory(null);
//             setProducts([]);
//           }
//           setSuccessMessage("Category deleted successfully!");
//         })
//         .catch((error) => {
//           console.error("Error deleting category:", error);
//           if (error.response) {
//             if (error.response.status === 404) {
//               setErrorMessage(
//                 `Category not deleted: ID ${categoryId} not found in database`
//               );
//             } else if (error.response.status === 500) {
//               setErrorMessage(
//                 `Category not deleted: Server error - Please try again later`
//               );
//             } else {
//               setErrorMessage(
//                 `Category not deleted: ${
//                   error.response.data?.message || "Unknown server error"
//                 }`
//               );
//             }
//           } else if (error.request) {
//             setErrorMessage(
//               `Category not deleted: No response from server - Check your connection`
//             );
//           } else {
//             setErrorMessage(
//               `Category not deleted: ${
//                 error.message || "Unknown error occurred"
//               }`
//             );
//           }
//         });
//     }
//   };

//   const handleAddCategoryClick = () => {
//     setShowAddCategory(true);
//     setSelectedCategory(null);
//     setShowAddProduct(false);
//     setEditingProduct(null);
//   };

//   const handleAddProductClick = () => {
//     setProductForm({
//       ...productForm,
//       category_id: selectedCategory.category_id,
//     });
//     setShowAddProduct(true);
//     setEditingProduct(null);
//   };

//   const handleShow = async (id) => {
//     try {
//       const response = await axios.get(
//         "http://localhost:8801/products/adminView"
//       );
//       const prods = response.data;

//       const filteredProd = prods.filter((product) => product.id === id);

//       console.log("Filtered Product:", filteredProd);

//       navigate("/productAdmin", {
//         state: {
//           filteredProds: filteredProd,
//           selectedCategory: selectedCategory,
//         },
//       });
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };

//   const handleCategorySubmit = (e) => {
//     e.preventDefault();

//     // Check for empty fields
//     if (!newCategory.name.trim() || !newCategory.number.trim()) {
//       const missingFields = [];
//       if (!newCategory.name.trim()) missingFields.push("Category Name");
//       if (!newCategory.number.trim()) missingFields.push("Category ID");

//       setErrorMessage(
//         `Category not added: Missing required fields - ${missingFields.join(
//           ", "
//         )}`
//       );
//       return;
//     }

//     // Check if category ID already exists
//     const categoryExists = categories.some(
//       (cat) => cat.category_id === newCategory.number
//     );
//     if (categoryExists) {
//       const existingCategory = categories.find(
//         (cat) => cat.category_id === newCategory.number
//       );
//       setErrorMessage(
//         `Category not added: ID ${newCategory.number} already exists (${
//           existingCategory?.category_name || "Unknown category"
//         })`
//       );
//       return;
//     }

//     axios
//       .post("http://localhost:8801/categories", newCategory)
//       .then(() => {
//         fetchCategories();
//         setShowAddCategory(false);
//         setNewCategory({ name: "", number: "" });
//         setSuccessMessage("Category added successfully!");
//       })
//       .catch((error) => {
//         console.error("Error adding category:", error);
//         if (error.response) {
//           // Server responded with an error status code
//           if (error.response.status === 400) {
//             setErrorMessage(
//               `Category not added: ID ${newCategory.number} already exists in database`
//             );
//           } else if (error.response.status === 500) {
//             setErrorMessage(
//               `Category not added: Server error - Please try again later`
//             );
//           } else {
//             setErrorMessage(
//               `Category not added: ${
//                 error.response.data?.message || "Unknown server error"
//               }`
//             );
//           }
//         } else if (error.request) {
//           // Request was made but no response received
//           setErrorMessage(
//             `Category not added: No response from server - Check your connection`
//           );
//         } else {
//           // Error in setting up the request
//           setErrorMessage(
//             `Category not added: ${error.message || "Unknown error occurred"}`
//           );
//         }
//       });
//   };

//   const handleProductSubmit = (e) => {
//     e.preventDefault();

//     // Check for empty required fields
//     const requiredFields = [
//       "id",
//       "name",
//       "description",
//       "size",
//       "color",
//       "price",
//       "quantity",
//     ];
//     const emptyFields = requiredFields.filter(
//       (field) =>
//         !productForm[field] || productForm[field].toString().trim() === ""
//     );

//     if (emptyFields.length > 0) {
//       const fieldLabels = {
//         id: "Product ID",
//         name: "Product Name",
//         description: "Description",
//         size: "Size",
//         color: "Color",
//         price: "Price",
//         quantity: "Quantity",
//       };

//       const missingFieldsLabels = emptyFields.map(
//         (field) => fieldLabels[field] || field
//       );
//       setErrorMessage(
//         `Product not added: Missing required fields - ${missingFieldsLabels.join(
//           ", "
//         )}`
//       );
//       return;
//     } else {
//       // Check if product ID already exists
//       const productExists = allProducts.some(
//         (product) => product.id === productForm.id
//       );
//       if (productExists) {
//         const existingProduct = allProducts.find(
//           (product) => product.id === productForm.id
//         );
//         setErrorMessage(
//           `Product not added: ID ${productForm.id} already exists (${
//             existingProduct?.name || "Unknown product"
//           })`
//         );
//         return;
//       }
//       // Add new product
//       axios
//         .post("http://localhost:8801/products", productForm)
//         .then(() => {
//           fetchProductsByCategory(selectedCategory.category_id);
//           fetchAllProducts(); // Update all products list
//           setShowAddProduct(false);
//           resetProductForm();
//           setSuccessMessage("Product added successfully!");
//         })
//         .catch((error) => {
//           console.error("Error adding product:", error);
//           if (error.response) {
//             // Server responded with an error status code
//             if (error.response.status === 400) {
//               setErrorMessage(
//                 `Product not added: Bad request - ${
//                   error.response.data.message || "Invalid data format"
//                 }`
//               );
//             } else if (error.response.status === 409) {
//               setErrorMessage(
//                 `Product not added: Conflict - Product ID ${productForm.id} already exists in database`
//               );
//             } else if (error.response.status === 500) {
//               setErrorMessage(
//                 `Product not added: Server error - Please try again later`
//               );
//             } else {
//               setErrorMessage(
//                 `Product not added: ${
//                   error.response.data.message || "Unknown server error"
//                 }`
//               );
//             }
//           } else if (error.request) {
//             // Request was made but no response received
//             setErrorMessage(
//               `Product not added: No response from server - Check your connection`
//             );
//           } else {
//             // Error in setting up the request
//             setErrorMessage(
//               `Product not added: ${error.message || "Unknown error occurred"}`
//             );
//           }
//         });
//     }
//   };

//   const resetProductForm = () => {
//     setProductForm({
//       id: "",
//       name: "",
//       description: "",
//       size: "",
//       color: "",
//       price: "",
//       quantity: "",
//       category_id: selectedCategory ? selectedCategory.category_id : "",
//     });
//   };

//   const handleInputChange = (e, formSetter, formState) => {
//     const { name, value } = e.target;
//     formSetter({
//       ...formState,
//       [name]: value,
//     });
//   };

//   if (!user || user.role !== "admin") {
//     return <Navigate to="/login" />;
//   }

//   return (
//     <div className={styles.adminContainer}>
//       <div className={styles.header}>
//         <h1>Admin Dashboard</h1>
//         <p>Admin: {user.name}</p>
//       </div>

//       {/* Message display */}
//       {errorMessage && (
//         <div className={styles.errorMessage}>
//           <p>{errorMessage}</p>
//         </div>
//       )}
//       {successMessage && (
//         <div className={styles.successMessage}>
//           <p>{successMessage}</p>
//         </div>
//       )}

//       <div className={styles.contentContainer}>
//         <div className={styles.categorySidebar}>
//           <h2>Categories</h2>
//           <div className={styles.categoryList}>
//             {categories.map((category) => (
//               <div key={category.category_id} className={styles.categoryItem}>
//                 <button
//                   className={`${styles.categoryButton} ${
//                     selectedCategory?.category_id === category.category_id
//                       ? styles.active
//                       : ""
//                   }`}
//                   onClick={() => handleCategoryClick(category)}
//                 >
//                   {category.category_name}
//                 </button>
//                 <button
//                   className={styles.deleteButton}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleDeleteCategory(category.category_id);
//                   }}
//                   title="Delete category"
//                 >
//                   ×
//                 </button>
//               </div>
//             ))}
//             <button
//               className={`${styles.categoryButton} ${styles.addButton}`}
//               onClick={handleAddCategoryClick}
//             >
//               + Add Category
//             </button>
//           </div>
//         </div>

//         <div className={styles.mainContent}>
//           {showAddCategory ? (
//             <div className={styles.formContainer}>
//               <h2>Add New Category</h2>
//               <form onSubmit={handleCategorySubmit}>
//                 <div className={styles.formGroup}>
//                   <label>Category Name:</label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={newCategory.name}
//                     onChange={(e) =>
//                       handleInputChange(e, setNewCategory, newCategory)
//                     }
//                     required
//                   />
//                 </div>
//                 <div className={styles.formGroup}>
//                   <label>Category ID:</label>
//                   <input
//                     type="text"
//                     name="number"
//                     value={newCategory.number}
//                     onChange={(e) =>
//                       handleInputChange(e, setNewCategory, newCategory)
//                     }
//                     required
//                   />
//                 </div>
//                 <div className={styles.formActions}>
//                   <button type="submit" className={styles.submitButton}>
//                     Add Category
//                   </button>
//                   <button
//                     type="button"
//                     className={styles.cancelButton}
//                     onClick={() => setShowAddCategory(false)}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           ) : showAddProduct ? (
//             <div className={styles.formContainer}>
//               <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
//               <form onSubmit={handleProductSubmit}>
//                 <div className={styles.formRow}>
//                   <div className={styles.formGroup}>
//                     <label>Product ID:</label>
//                     <input
//                       type="text"
//                       name="id"
//                       value={productForm.id}
//                       onChange={(e) =>
//                         handleInputChange(e, setProductForm, productForm)
//                       }
//                       required
//                       disabled={editingProduct}
//                     />
//                   </div>
//                   <div className={styles.formGroup}>
//                     <label>Name:</label>
//                     <input
//                       type="text"
//                       name="name"
//                       value={productForm.name}
//                       onChange={(e) =>
//                         handleInputChange(e, setProductForm, productForm)
//                       }
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className={styles.formGroup}>
//                   <label>Description:</label>
//                   <textarea
//                     name="description"
//                     value={productForm.description}
//                     onChange={(e) =>
//                       handleInputChange(e, setProductForm, productForm)
//                     }
//                     required
//                   />
//                 </div>

//                 <div className={styles.formRow}>
//                   <div className={styles.formGroup}>
//                     <label>Size:</label>
//                     <input
//                       type="text"
//                       name="size"
//                       value={productForm.size}
//                       onChange={(e) =>
//                         handleInputChange(e, setProductForm, productForm)
//                       }
//                       required
//                     />
//                   </div>
//                   <div className={styles.formGroup}>
//                     <label>Color:</label>
//                     <input
//                       type="text"
//                       name="color"
//                       value={productForm.color}
//                       onChange={(e) =>
//                         handleInputChange(e, setProductForm, productForm)
//                       }
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className={styles.formRow}>
//                   <div className={styles.formGroup}>
//                     <label>Price:</label>
//                     <input
//                       type="number"
//                       name="price"
//                       value={productForm.price}
//                       onChange={(e) =>
//                         handleInputChange(e, setProductForm, productForm)
//                       }
//                       required
//                     />
//                   </div>
//                   <div className={styles.formGroup}>
//                     <label>Quantity:</label>
//                     <input
//                       type="number"
//                       name="quantity"
//                       value={productForm.quantity}
//                       onChange={(e) =>
//                         handleInputChange(e, setProductForm, productForm)
//                       }
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className={styles.formActions}>
//                   <button type="submit" className={styles.submitButton}>
//                     {editingProduct ? "Update Product" : "Add Product"}
//                   </button>
//                   <button
//                     type="button"
//                     className={styles.cancelButton}
//                     onClick={() => {
//                       setShowAddProduct(false);
//                       setEditingProduct(null);
//                     }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           ) : selectedCategory ? (
//             <div className={styles.productsContainer}>
//               <div className={styles.categoryHeader}>
//                 <h2>{selectedCategory.category_name} Products</h2>
//                 <button
//                   className={styles.addProductButton}
//                   onClick={handleAddProductClick}
//                 >
//                   + Add Product
//                 </button>
//               </div>

//               {products.length > 0 ? (
//                 <div className={styles.productsGrid}>
//                   {products.map((product) => (
//                     <div
//                       key={product.product_id}
//                       className={styles.productCard}
//                     >
//                       <h3>{product.name}</h3>
//                       <p className={styles.productDescription}>
//                         {product.description}
//                       </p>
//                       <div className={styles.productDetails}>
//                         <p>
//                           <strong>id:</strong> {product.id}
//                         </p>
//                       </div>
//                       <div className={styles.productActions}>
//                         <button
//                           className={styles.editButton}
//                           onClick={() => handleShow(product.id)}
//                         >
//                           All products
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className={styles.noProducts}>
//                   No products found in this category.
//                 </p>
//               )}
//             </div>
//           ) : (
//             <div className={styles.welcomeMessage}>
//               <h2>Welcome to the Admin Dashboard</h2>
//               <p>
//                 Select a category from the sidebar or add a new one to manage
//                 products.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminPage;
import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./adminPage.module.css";

function AdminPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();

  // Form states, includes image
  const [newCategory, setNewCategory] = useState({ name: "", number: "" });
  const [productForm, setProductForm] = useState({
    id: "",
    name: "",
    description: "",
    size: "",
    color: "",
    price: "",
    quantity: "",
    category_id: "",
    image: null, // for image file
  });

  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory.category_id);
      setProductForm((prev) => ({
        ...prev,
        category_id: selectedCategory.category_id,
      }));
    } else {
      setProducts([]);
      setShowAddProduct(false);
      setShowAddCategory(false);
      setEditingProduct(null);
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

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8801/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8801/products");
      setAllProducts(res.data);
    } catch (error) {
      console.error("Error fetching all products:", error);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      const res = await axios.get("http://localhost:8801/products");
      const filtered = res.data.filter(
        (product) => product.category_id === categoryId
      );
      setProducts(filtered);
    } catch (error) {
      console.error("Error fetching products:", error);
      setErrorMessage("Failed to load products. Please try again.");
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? All products in this category will also be deleted."
      )
    ) {
      try {
        await axios.delete(`http://localhost:8801/categories/${categoryId}`);
        fetchCategories();
        if (selectedCategory?.category_id === categoryId) {
          setSelectedCategory(null);
          setProducts([]);
        }
        setSuccessMessage("Category deleted successfully!");
      } catch (error) {
        console.error("Error deleting category:", error);
        setErrorMessage("Category not deleted: Server error.");
      }
    }
  };

  const handleAddCategoryClick = () => {
    setShowAddCategory(true);
    setSelectedCategory(null);
    setShowAddProduct(false);
    setEditingProduct(null);
    setNewCategory({ name: "", number: "" });
  };

  const handleAddProductClick = () => {
    setShowAddProduct(true);
    setEditingProduct(null);
    setProductForm({
      id: "",
      name: "",
      description: "",
      size: "",
      color: "",
      price: "",
      quantity: "",
      category_id: selectedCategory?.category_id || "",
      image: null,
    });
  };

  // This is the key function: fetch product with specific id and navigate with it
  const handleShow = async (id) => {
    try {
      const response = await axios.get(
        "http://localhost:8801/products/adminView"
      );
      const prods = response.data;
      const filteredProd = prods.filter((product) => product.id === id);

      // Debug log (optional)
      console.log("Filtered Product:", filteredProd);

      navigate("/productAdmin", {
        state: {
          filteredProds: filteredProd,
          selectedCategory: selectedCategory,
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      setErrorMessage("Failed to load product details.");
    }
  };

  const handleFileChange = (e) => {
    setProductForm((prev) => ({
      ...prev,
      image: e.target.files[0] || null,
    }));
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    if (!newCategory.name.trim() || !newCategory.number.trim()) {
      setErrorMessage("Category not added: Missing required fields.");
      return;
    }
    if (categories.some((cat) => cat.category_id === newCategory.number)) {
      setErrorMessage(
        `Category not added: ID ${newCategory.number} already exists.`
      );
      return;
    }

    try {
      await axios.post("http://localhost:8801/categories", newCategory);
      fetchCategories();
      setShowAddCategory(false);
      setNewCategory({ name: "", number: "" });
      setSuccessMessage("Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
      setErrorMessage("Category not added: Server error.");
    }
  };

  const handleProductSubmit = async (e) => {
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
    for (const field of requiredFields) {
      if (!productForm[field] || productForm[field].toString().trim() === "") {
        setErrorMessage(`Product not added: Missing field - ${field}`);
        return;
      }
    }

    if (!editingProduct && allProducts.some((p) => p.id === productForm.id)) {
      setErrorMessage(
        `Product not added: ID ${productForm.id} already exists.`
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", productForm.id);
      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("size", productForm.size);
      formData.append("color", productForm.color);
      formData.append("price", productForm.price);
      formData.append("quantity", productForm.quantity);
      formData.append("category_id", productForm.category_id);
      if (productForm.image) {
        formData.append("image", productForm.image);
      }

      if (editingProduct) {
        // TODO: Implement update with image if needed
      } else {
        await axios.post("http://localhost:8801/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      fetchProductsByCategory(selectedCategory.category_id);
      fetchAllProducts();
      setShowAddProduct(false);
      setEditingProduct(null);
      setSuccessMessage("Product added successfully!");
      setProductForm({
        id: "",
        name: "",
        description: "",
        size: "",
        color: "",
        price: "",
        quantity: "",
        category_id: selectedCategory?.category_id || "",
        image: null,
      });
    } catch (error) {
      console.error("Error adding product:", error);
      setErrorMessage("Product not added: Server error.");
    }
  };

  const handleInputChange = (e, setter, state) => {
    const { name, value } = e.target;
    setter({
      ...state,
      [name]: value,
    });
  };

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Admin: {user.name}</p>
      </div>

      {errorMessage && (
        <div className={styles.errorMessage}>
          <p>{errorMessage}</p>
        </div>
      )}
      {successMessage && (
        <div className={styles.successMessage}>
          <p>{successMessage}</p>
        </div>
      )}

      <div className={styles.contentContainer}>
        <div className={styles.categorySidebar}>
          <h2>Categories</h2>
          <div className={styles.categoryList}>
            {categories.map((category) => (
              <div key={category.category_id} className={styles.categoryItem}>
                <button
                  className={`${styles.categoryButton} ${
                    selectedCategory?.category_id === category.category_id
                      ? styles.active
                      : ""
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category.category_name}
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category.category_id);
                  }}
                  title="Delete category"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              className={`${styles.categoryButton} ${styles.addButton}`}
              onClick={handleAddCategoryClick}
            >
              + Add Category
            </button>
          </div>
        </div>

        <div className={styles.mainContent}>
          {showAddCategory ? (
            <div className={styles.formContainer}>
              <h2>Add New Category</h2>
              <form onSubmit={handleCategorySubmit}>
                <div className={styles.formGroup}>
                  <label>Category Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={newCategory.name}
                    onChange={(e) =>
                      handleInputChange(e, setNewCategory, newCategory)
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Category ID:</label>
                  <input
                    type="text"
                    name="number"
                    value={newCategory.number}
                    onChange={(e) =>
                      handleInputChange(e, setNewCategory, newCategory)
                    }
                    required
                  />
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitButton}>
                    Add Category
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowAddCategory(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : showAddProduct ? (
            <div className={styles.formContainer}>
              <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <form
                onSubmit={handleProductSubmit}
                encType="multipart/form-data"
              >
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Product ID:</label>
                    <input
                      type="text"
                      name="id"
                      value={productForm.id}
                      onChange={(e) =>
                        handleInputChange(e, setProductForm, productForm)
                      }
                      required
                      disabled={editingProduct}
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
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Description:</label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={(e) =>
                      handleInputChange(e, setProductForm, productForm)
                    }
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
                      required
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
                      required
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
                      step="0.01"
                      min="0"
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
                      min="0"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Image:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {productForm.image && (
                    <p>Selected file: {productForm.image.name}</p>
                  )}
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitButton}>
                    {editingProduct ? "Update Product" : "Add Product"}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => {
                      setShowAddProduct(false);
                      setEditingProduct(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : selectedCategory ? (
            <div className={styles.productsContainer}>
              <div className={styles.categoryHeader}>
                <h2>{selectedCategory.category_name} Products</h2>
                <button
                  className={styles.addProductButton}
                  onClick={handleAddProductClick}
                >
                  + Add Product
                </button>
              </div>

              {products.length > 0 ? (
                <div className={styles.productsGrid}>
                  {products.map((product) => (
                    <div
                      key={product.product_id}
                      className={styles.productCard}
                    >
                      <h3>{product.name}</h3>
                      <p className={styles.productDescription}>
                        {product.description}
                      </p>
                      <div className={styles.productDetails}>
                        <p>
                          <strong>ID:</strong> {product.id}
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
                        {product.image && (
                          <img
                            src={`/uploads/${product.image}`}
                            alt={product.name}
                            style={{ maxWidth: "150px", marginTop: "8px" }}
                          />
                        )}
                      </div>
                      <div className={styles.productActions}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleShow(product.id)}
                        >
                          All products
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noProducts}>
                  No products found in this category.
                </p>
              )}
            </div>
          ) : (
            <div className={styles.welcomeMessage}>
              <h2>Welcome to the Admin Dashboard</h2>
              <p>
                Select a category from the sidebar or add a new one to manage
                products.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
