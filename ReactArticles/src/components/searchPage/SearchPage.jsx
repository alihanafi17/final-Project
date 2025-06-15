import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProductShow from "../productShow/ProductShow";
import classes from "./searchPage.module.css";

function SearchPage({ products }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setSearchParams(query ? { q: query } : {});
  }, [query, setSearchParams]);

  const trimmed = query.trim().toLowerCase();
  let results = [];
  if (trimmed) {
    if (window.__FUSE__) {
      results = window.__FUSE__.search(trimmed).map((r) => r.item);
    } else {
      results = products.filter((p) => p.name.toLowerCase().includes(trimmed));
    }
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.searchBar}>
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button onClick={() => navigate("/")} className={classes.backBtn} aria-label="Back">
          ←
        </button>
      </div>

      <div className={classes.grid}>
        {results.map((p) => (
          <ProductShow key={p.id} product={p} />
        ))}
        {query && results.length === 0 && (
          <p className={classes.noResults}>No products found</p>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
