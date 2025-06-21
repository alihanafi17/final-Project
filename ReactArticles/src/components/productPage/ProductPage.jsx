// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import mensImage from "../../assets/img/mensCollectionCover.jpg";
// import classes from "./productPage.module.css";

// function ProductPage({ products }) {
//   const { id } = useParams();
//   const [selectedSize, setSelectedSize] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [productData, setProductData] = useState(null);

//   useEffect(() => {
//     if (products && products.length > 0) {
//       const foundProduct = products.find(
//         (product) =>
//           String(product.product_id) === String(id) ||
//           String(product._id) === String(id) ||
//           String(product.id) === String(id)
//       );
//       setProductData(foundProduct);
//     }
//   }, [id, products]);

//   const handleSizeClick = (size) => {
//     setSelectedSize(size);
//   };

//   const handleQuantityChange = (amount) => {
//     setQuantity((prev) => Math.max(1, prev + amount));
//   };

//   const sizes = ["XS", "S", "M", "L"];

//   if (!productData) {
//     return <div className={classes.loading}>Loading product...</div>;
//   }

//   return (
//     <div className={classes.fullProduct}>
//       <img
//         src={productData.image || mensImage}
//         alt={productData.name}
//         className={classes.productImg}
//       />
//       <div className={classes.productInfo}>
//         <h2>{productData.name}</h2>
//         <p className={classes.price}>${productData.price}</p>
//         <p className={classes.description}>{productData.description}</p>

//         <div className={classes.sizeSection}>
//           <h4>Size</h4>
//           <div className={classes.sizeOptions}>
//             {sizes.map((size) => (
//               <button
//                 key={size}
//                 className={`${classes.sizeButton} ${
//                   selectedSize === size ? classes.selected : ""
//                 }`}
//                 onClick={() => handleSizeClick(size)}
//               >
//                 {size}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className={classes.quantitySection}>
//           <h4>Quantity</h4>
//           <div className={classes.quantityControl}>
//             <button onClick={() => handleQuantityChange(-1)}>-</button>
//             <span>{quantity}</span>
//             <button onClick={() => handleQuantityChange(1)}>+</button>
//           </div>
//         </div>

//         <button className={classes.addToCart}>Add to Cart</button>
//       </div>
//     </div>
//   );
// }

// export default ProductPage;
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import mensImage from "../../assets/img/mensCollectionCover.jpg";
import classes from "./productPage.module.css";
import axios from "axios";

function ProductPage() {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [productData, setProductData] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [maxQuantity, setMaxQuantity] = useState(0);

  const fetchData = () => {
    axios
      .get(`/products/${id}`)
      .then((res) => {
        setProductData(res.data);
        console.log(res.data); // Data from API
      })
      .catch((error) => {
        console.error("Error:", error);
      });
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

  return (
    <div className={classes.fullProduct}>
      <img
        src={productData.image || mensImage}
        alt={productData.name}
        className={classes.productImg}
      />

      {productData && productData.length !== 0 && (
        <div className={classes.productInfo}>
          <h2>{productData[0].name}</h2>
          <p className={classes.price}>${productData[0].price}</p>
          <p className={classes.description}>{productData[0].description}</p>

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
                    {productData.map(
                      (product) =>
                        product.size === selectedSize && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity((q) => Math.max(1, q - 1))
                              }
                            >
                              -
                            </button>
                            {/* <input
                          type="number"
                          name="quantity"
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(Math.max(1, parseInt(e.target.value)))
                          }
                          min="1"
                          
                          className={classes.quantityInput}
                        /> */}
                            <input
                              type="number"
                              name="quantity"
                              value={quantity}
                              onChange={(e) =>
                                setQuantity(
                                  Math.min(
                                    maxQuantity,
                                    Math.max(1, parseInt(e.target.value) || 1)
                                  )
                                )
                              }
                              min="1"
                              max={maxQuantity}
                              className={classes.quantityInput}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setQuantity((q) => Math.min(maxQuantity, q + 1))
                              }
                              // onClick={() => setQuantity(maxQuantity)}
                            >
                              +
                            </button>
                          </>
                        )
                    )}
                  </div>
                </>
              ) : (
                selectedColor !== "" &&
                selectedSize !== "" && <p>no products</p>
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
      )}
    </div>
  );
}

export default ProductPage;
