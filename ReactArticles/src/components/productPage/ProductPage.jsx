import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import mensImage from "../../assets/img/mensCollectionCover.jpg";
import classes from "./productPage.module.css";
import axios from "axios";

function ProductPage() {
  const { id } = useParams();
  const [productData, setProductData] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [maxQuantity, setMaxQuantity] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [editForm, setEditForm] = useState({
    size: "",
    color: "",
    price: "",
    quantity: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const classes = {
    fullProduct: "full-product",
    productImg: "product-img",
    productInfo: "product-info",
    price: "price",
    description: "description",
    sizeSection: "size-section",
    sizeButton: "size-button",
    selected: "selected",
    quantitySection: "quantity-section",
    quantityControl: "quantity-control",
    quantityButton: "quantity-button",
    quantity: "quantity",
    availableQuantity: "available-quantity",
    outOfStock: "out-of-stock",
    addToCart: "add-to-cart",
    error: "error-message",
    success: "success-message",
  };

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

  const fetchData = () => {
    axios
      .get(`http://localhost:8801/products/${id}`)
      .then((res) => {
        setProductData(res.data);
        console.log("Fetched product data:", res.data);
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setErrorMessage("Failed to load product. Please try again.");
      });
  };

  // Handle edit button click
  const handleEditClick = (e, variant) => {
    e.stopPropagation();
    setEditingVariant(variant);
    setEditForm({
      size: variant.size || "",
      color: variant.color || "",
      quantity: variant.quantity || "",
      price: variant.price || ""
    });
    setIsEditing(true);
  };

  // Handle input changes in edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission for updating a variant
  const handleUpdateVariant = async (e) => {
    e.preventDefault();
    
    if (!editingVariant) return;

    try {
      await axios.put(
        `http://localhost:8801/products/${editingVariant.product_id}`, 
        editForm
      );
      
      setSuccessMessage("Product variant updated successfully!");
      fetchData(); // Refresh the data
      setIsEditing(false);
      setEditingVariant(null);
    } catch (error) {
      console.error("Error updating product:", error);
      setErrorMessage("Failed to update product. Please try again.");
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingVariant(null);
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const maxQ = productData.filter(
      (prod) => prod.size === selectedSize && prod.color === selectedColor
    );
    maxQ.length !== 0 && setMaxQuantity(maxQ[0].quantity);
    console.log(maxQ);
  }, [selectedColor, selectedSize]);

  // useEffect(() => {
  //   if (products && products.length > 0) {
  //     const foundProduct = products.find(
  //       (product) =>
  //         String(product.product_id) === String(id) ||
  //         String(product._id) === String(id) ||
  //         String(product.id) === String(id)
  //     );
  //     setProductData(foundProduct);
  //   }
  // }, [id, products]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }

    // You can send the data to backend here
    console.log("Add to cart:", {
      productId: productData.id,
      size: selectedSize,
      quantity,
    });
  };

  const uniqueColors = [...new Set(productData.map((prod) => prod.color))];

  const sizes = ["XS", "S", "M", "L"];

  if (!productData) {
    return <div className={classes.loading}>Loading product...</div>;
  }

  // Render the edit form if in editing mode
  if (isEditing && editingVariant) {
    return (
      <div className={classes.fullProduct}>
        <h2>Edit Product Variant</h2>
        {errorMessage && <div className={classes.error}>{errorMessage}</div>}
        {successMessage && <div className={classes.success}>{successMessage}</div>}
        
        <form onSubmit={handleUpdateVariant} className={classes.form}>
          <div className={classes.formGroup}>
            <label>Size:</label>
            <select
              name="size"
              value={editForm.size}
              onChange={handleEditInputChange}
              required
            >
              <option value="">Select Size</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>
          
          <div className={classes.formGroup}>
            <label>Color:</label>
            <input
              type="text"
              name="color"
              value={editForm.color}
              onChange={handleEditInputChange}
              required
            />
          </div>
          
          <div className={classes.formGroup}>
            <label>Price:</label>
            <input
              type="number"
              name="price"
              value={editForm.price}
              onChange={handleEditInputChange}
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div className={classes.formGroup}>
            <label>Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={editForm.quantity}
              onChange={handleEditInputChange}
              min="0"
              required
            />
          </div>
          
          <div className={classes.formActions}>
            <button type="submit" className={classes.saveButton}>Save Changes</button>
            <button type="button" onClick={handleCancelEdit} className={classes.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render the edit form if in editing mode
  if (isEditing && editingVariant) {
    return (
      <div className={classes.fullProduct}>
        <h2>Edit Product Variant</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <form onSubmit={handleUpdateVariant} className="edit-form">
          <div className="form-group">
            <label>Size:</label>
            <select
              name="size"
              value={editForm.size}
              onChange={handleEditInputChange}
              required
            >
              <option value="">Select Size</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Color:</label>
            <input
              type="text"
              name="color"
              value={editForm.color}
              onChange={handleEditInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Price:</label>
            <input
              type="number"
              name="price"
              value={editForm.price}
              onChange={handleEditInputChange}
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={editForm.quantity}
              onChange={handleEditInputChange}
              min="0"
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-button">Save Changes</button>
            <button type="button" onClick={handleCancelEdit} className="cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render the edit form if in editing mode
  if (isEditing && editingVariant) {
    return (
      <div className={classes.fullProduct}>
        <h2>Edit Product Variant</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        
        <form onSubmit={handleUpdateVariant} className="edit-form">
          <div className="form-group">
            <label>Size:</label>
            <select
              name="size"
              value={editForm.size}
              onChange={handleEditInputChange}
              required
            >
              <option value="">Select Size</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Color:</label>
            <input
              type="text"
              name="color"
              value={editForm.color}
              onChange={handleEditInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Price:</label>
            <input
              type="number"
              name="price"
              value={editForm.price}
              onChange={handleEditInputChange}
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              name="quantity"
              value={editForm.quantity}
              onChange={handleEditInputChange}
              min="0"
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-button">Save Changes</button>
            <button type="button" onClick={handleCancelEdit} className="cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render the product page
  return (
    <div className={classes.fullProduct}>
      {productData && productData.length > 0 && (
        <>
          <img
            src={productData[0]?.image || mensImage}
            alt={productData[0]?.name}
            className={classes.productImg}
          />
          <div className={classes.productInfo}>
            <div className="product-header">
              <h2>{productData[0].name}</h2>
              <div className="variants-container">
                <h3>Product Variants</h3>
                <div className="variants-list">
                  {productData.map((variant) => (
                    <div key={variant.product_id} className="variant-item">
                      <span>Size: {variant.size}, Color: {variant.color}, Qty: {variant.quantity}, Price: ${variant.price}</span>
                      <button
                        type="button"
                        onClick={(e) => handleEditClick(e, variant)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className={classes.price}>${productData[0].price}</p>
            <p className={classes.description}>{productData[0].description}</p>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="color-select">Choose a color: </label>
                <select
                  id="color-select"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  {uniqueColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            {/* Size Selection */}
            <div className={classes.sizeSection}>
              <h4>Size</h4>
              <div className={classes.sizeOptions}>
                {/* {sizes.map((size) => (
                  <button
                    type="button"
                    key={size}
                    className={`${classes.sizeButton} ${
                      selectedSize === size ? classes.selected : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))} */}
                {productData.map(
                  (product) =>
                    product.color === selectedColor && (
                      <button
                        type="button"
                        key={product.size}
                        className={`${classes.sizeButton} ${
                          selectedSize === product.size ? classes.selected : ""
                        }`}
                        onClick={() => setSelectedSize(product.size)}
                      >
                        {product.size}
                      </button>
                    )
                )}
              </div>
              <input type="hidden" name="size" value={selectedSize} />
            </div>

            {/* Quantity Selection */}
            <div className={classes.quantitySection}>
              {maxQuantity !== 0 ? (
                <>
                  <h4>Quantity</h4>
                  <div className={classes.quantityControl}>
                    {productData.map((product) =>
                      product.size === selectedSize && (
                        <React.Fragment key={product.product_id}>
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className={classes.quantityButton}
                            disabled={quantity <= 1}
                          >
                            -
                          </button>
                          <span className={classes.quantity}>{quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                            className={classes.quantityButton}
                            disabled={quantity >= maxQuantity}
                          >
                            +
                          </button>
                        </React.Fragment>
                      )
                    )}
                  </div>
                  <p className={classes.availableQuantity}>
                    {maxQuantity} available
                  </p>
                </>
              ) : (
                <p className={classes.outOfStock}>
                  This item is currently out of stock
                </p>
              )}
            </div>

            <button
              type="submit"
              className={classes.addToCart}
              disabled={!selectedSize}
            >
              Add to Cart
            </button>
          </form>
        </div>
      </>
    )}
  </div>
  );
}

export default ProductPage;
