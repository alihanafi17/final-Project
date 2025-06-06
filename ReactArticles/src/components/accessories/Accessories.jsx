import React, { useState } from "react";
import ProductShow from "../productShow/ProductShow";
import classes from "./accessories.module.css";
function Accessories({ products }) {
  const [sortOption, setSortOption] = useState("default");

  const filteredProducts = products.filter(
    (product) => product.category_id === 3
  );

  // Sort products based on selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "name-a-z":
        return a.name.localeCompare(b.name);
      case "name-z-a":
        return b.name.localeCompare(a.name);
      default:
        return 0; // Default order (as received from API)
    }
  });

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  return (
    <div className={classes.accessoriesContainer}>
      <div className={classes.collectionHeader}>
        <h1>Accessories Collection</h1>
        <p>Complete your look with our premium accessories, designed to add the perfect finishing touch to any outfit with style and sophistication.</p>
      </div>
      
      <div className={classes.sortContainer}>
        <label htmlFor="sort-select">Sort by: </label>
        <select
          id="sort-select"
          value={sortOption}
          onChange={handleSortChange}
          className={classes.sortSelect}
        >
          <option value="default">Default</option>
          <option value="price-low-high">Price: Low to High</option>
          <option value="price-high-low">Price: High to Low</option>
          <option value="name-a-z">Name: A to Z</option>
          <option value="name-z-a">Name: Z to A</option>
        </select>
      </div>

      <div className={classes.productGrid}>
        {sortedProducts.length > 0 ? (
          sortedProducts.map((product) => (
            <ProductShow key={crypto.randomUUID()} product={product} />
          ))
        ) : (
          <div className={classes.noProducts}>No accessories found. Check back soon for new arrivals!</div>
        )}
      </div>
    </div>
  );
}

export default Accessories;
