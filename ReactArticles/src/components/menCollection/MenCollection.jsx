import React, { useState } from "react";
import classes from "./menCollection.module.css";
import ProductShow from "../productShow/ProductShow";

function MenCollection({ products }) {
  const [sortOption, setSortOption] = useState("default");

  // Filter men's products
  const filteredProducts = products.filter(
    (product) => product.category_id === 1
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
        return 0;
    }
  });

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  return (
    <div className={classes.menCollectionContainer}>
      <div className={classes.collectionHeader}>
        <h1>Men's Collection</h1>
        <p>
          Discover refined essentials for the modern man, combining exceptional
          craftsmanship with contemporary design for effortless, sophisticated
          style.
        </p>
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
        {sortedProducts.map((product) => (
          <ProductShow key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default MenCollection;
