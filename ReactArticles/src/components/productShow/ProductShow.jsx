import React, { useState, useEffect } from "react";
import classes from "./productShow.module.css";
import mensImage from "../../assets/img/mensCollectionCover.jpg";
import { useNavigate } from "react-router-dom";
import ProductPage from "../productPage/ProductPage";

function ProductShow({ product, featured = false, onClose }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [productData, setProductData] = useState("");
  const [currentId, setCurrentId] = useState("");

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Call onClose function when modal is closed if it exists
      if (!showModal && onClose) {
        onClose();
      }
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal, onClose]);

  const handleProductClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className={featured ? classes.featuredItem : classes.featuredGrid}>
        <div
          key={product.product_id}
          className={`${classes.card} ${featured ? classes.featuredCard : ""}`}
        >
          <div className={classes.imageContainer}>
            <img
              onClick={handleProductClick}
              src={mensImage}
              alt={product.name}
              className={classes.image}
            />
          </div>
          <div className={classes.info}>
            <h3 className={classes.name}>{product.name}</h3>
            <p className={classes.price}>${product.price}</p>
            <button
              className={classes.cartBtn}
              data={product.id}
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className={classes.modal}>
          <div className={classes.modalContent}>
            <button className={classes.closeButton} onClick={handleCloseModal}>
              ×
            </button>
            {/* {navigate(`/products/${product.id}`)} */}
            <ProductPage />
          </div>
        </div>
      )}
    </>
  );
}

export default ProductShow;
