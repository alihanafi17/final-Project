import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import mensImage from "../../assets/img/mensCollectionCover.jpg";
import classes from "./productPage.module.css";
import { useCart } from "../../context/CartContext";

function ProductPage({ products }) {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [productData, setProductData] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (products && products.length > 0) {
      const foundProduct = products.find(
        (product) =>
          String(product.product_id) === String(id) ||
          String(product._id) === String(id) ||
          String(product.id) === String(id)
      );
      setProductData(foundProduct);
    }
  }, [id, products]);

  const handleSizeClick = (size) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    addToCart(productData, selectedSize, quantity);
    alert("Product added to cart!");
  };

  const sizes = ["XS", "S", "M", "L"];

  if (!productData) {
    return <div className={classes.loading}>Loading product...</div>;
  }

  return (
    <div className={classes.fullProduct}>
      <img
        src={productData.image || mensImage}
        alt={productData.name}
        className={classes.productImg}
      />
      <div className={classes.productInfo}>
        <h2>{productData.name}</h2>
        <p className={classes.price}>${productData.price}</p>
        <p className={classes.description}>{productData.description}</p>

        <div className={classes.sizeSection}>
          <h4>Size</h4>
          <div className={classes.sizeOptions}>
            {sizes.map((size) => (
              <button
                key={size}
                className={`${classes.sizeButton} ${
                  selectedSize === size ? classes.selected : ""
                }`}
                onClick={() => handleSizeClick(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className={classes.quantitySection}>
          <h4>Quantity</h4>
          <div className={classes.quantityControl}>
            <button onClick={() => handleQuantityChange(-1)}>-</button>
            <span>{quantity}</span>
            <button onClick={() => handleQuantityChange(1)}>+</button>
          </div>
        </div>

        <button className={classes.addToCart} onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductPage;
