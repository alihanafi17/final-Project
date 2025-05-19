import React from "react";
import classes from "./productShow.module.css";
import mensImage from "../../assets/img/mensCollectionCover.jpg";
import { useNavigate } from "react-router-dom";

function ProductShow({ product, featured = false }) {
  const navigate = useNavigate();
  
  const handleProductClick = () => {
    navigate(`/products/${product.product_id}`);
  };
  
  return (
    <div className={featured ? classes.featuredItem : classes.featuredGrid}>
      <div key={product.product_id} className={`${classes.card} ${featured ? classes.featuredCard : ''}`}>
        <div className={classes.imageContainer}>
          <img
            onClick={handleProductClick}
            src={mensImage}
            alt={product.name}
            className={classes.image}
          />
          {/* Featured badge removed as requested */}
        </div>
        <div className={classes.info}>
          <h3 className={classes.name}>{product.name}</h3>
          <p className={classes.price}>${product.price}</p>
          <button className={classes.cartBtn}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

export default ProductShow;
