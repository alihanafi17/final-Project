// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import mensImage from "../../assets/img/mensCollectionCover.jpg";
// import classes from "./productPage.module.css";
// import axios from "axios";

// function ProductPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [selectedSize, setSelectedSize] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [productData, setProductData] = useState([]);
//   const [selectedColor, setSelectedColor] = useState("");
//   const [maxQuantity, setMaxQuantity] = useState(0);

//   useEffect(() => {
//     axios
//       .get(`/products/${id}`)
//       .then((res) => {
//         setProductData(res.data);
//         console.log(res.data);
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   }, [id]);

//   useEffect(() => {
//     const maxQ = productData.filter(
//       (prod) => prod.size === selectedSize && prod.color === selectedColor
//     );
//     if (maxQ.length !== 0) setMaxQuantity(maxQ[0].quantity);
//   }, [selectedColor, selectedSize, productData]);

//   const handleAddToCart = async (selectedColor, selectedSize, quantity, id) => {
//     if (!selectedSize || !selectedColor) {
//       alert("Please select both color and size.");
//       return;
//     }

//     const email = localStorage.getItem("userEmail");
//     if (!email) {
//       alert("You must be logged in to add items to cart.");
//       return;
//     }

//     const product = productData.find(
//       (prod) => prod.size === selectedSize && prod.color === selectedColor
//     );

//     if (!product) {
//       alert("Product not found!");
//       return;
//     }

//     try {
//       const res = await axios.post("http://localhost:8801/cart/addToCart", {
//         email,
//         product_id: product.product_id,
//         quantity,
//       });

//       if (res.status === 200) {
//         navigate("/cartPage");
//       } else {
//         alert("Failed to add product to cart.");
//       }
//     } catch (err) {
//       console.error("Add to cart failed:", err);
//       alert("Server error while adding to cart.");
//     }
//   };

//   const uniqueColors = [...new Set(productData.map((prod) => prod.color))];
//   const sizes = ["XS", "S", "M", "L"];

//   if (!productData || productData.length === 0) {
//     return <div className={classes.loading}>Loading product...</div>;
//   }

//   return (
//     <div className={classes.fullProduct}>
//       <img
//         src={productData[0].image || mensImage}
//         alt={productData[0].name}
//         className={classes.productImg}
//       />

//       <div className={classes.productInfo}>
//         <h2>{productData[0].name}</h2>
//         <p className={classes.price}>${productData[0].price}</p>
//         <p className={classes.description}>{productData[0].description}</p>

//         <div>
//           <label htmlFor="color-select">Choose a color: </label>
//           <select
//             id="color-select"
//             value={selectedColor}
//             onChange={(e) => setSelectedColor(e.target.value)}
//           >
//             <option value="">-- Select --</option>
//             {uniqueColors.map((color) => (
//               <option key={color} value={color}>
//                 {color}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className={classes.sizeSection}>
//           <h4>Size</h4>
//           <div className={classes.sizeOptions}>
//             {productData.map(
//               (product) =>
//                 product.color === selectedColor && (
//                   <button
//                     type="button"
//                     key={product.size}
//                     className={`${classes.sizeButton} ${
//                       selectedSize === product.size ? classes.selected : ""
//                     }`}
//                     onClick={() => setSelectedSize(product.size)}
//                   >
//                     {product.size}
//                   </button>
//                 )
//             )}
//           </div>
//         </div>

//         <div className={classes.quantitySection}>
//           {maxQuantity !== 0 ? (
//             <>
//               <h4>Quantity</h4>
//               <div className={classes.quantityControl}>
//                 <button
//                   type="button"
//                   onClick={() => setQuantity((q) => Math.max(1, q - 1))}
//                 >
//                   -
//                 </button>
//                 <input
//                   type="number"
//                   name="quantity"
//                   value={quantity}
//                   onChange={(e) =>
//                     setQuantity(
//                       Math.min(
//                         maxQuantity,
//                         Math.max(1, parseInt(e.target.value) || 1)
//                       )
//                     )
//                   }
//                   min="1"
//                   max={maxQuantity}
//                   className={classes.quantityInput}
//                 />
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setQuantity((q) => Math.min(maxQuantity, q + 1))
//                   }
//                 >
//                   +
//                 </button>
//               </div>
//             </>
//           ) : (
//             selectedColor !== "" && selectedSize !== "" && <p>Out of stock</p>
//           )}
//         </div>

//         <button
//           type="button"
//           className={classes.addToCart}
//           disabled={!selectedSize}
//           onClick={() =>
//             handleAddToCart(selectedColor, selectedSize, quantity, id)
//           }
//         >
//           Add to Cart
//         </button>
//       </div>
//     </div>
//   );
// }

// export default ProductPage;
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import mensImage from "../../assets/img/mensCollectionCover.jpg";
import classes from "./productPage.module.css";
import axios from "axios";

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [productData, setProductData] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [maxQuantity, setMaxQuantity] = useState(0);

  useEffect(() => {
    axios
      .get(`http://localhost:8801/products/${id}`)
      .then((res) => {
        setProductData(res.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [id]);

  useEffect(() => {
    const maxQ = productData.filter(
      (prod) => prod.size === selectedSize && prod.color === selectedColor
    );
    if (maxQ.length !== 0) setMaxQuantity(maxQ[0].quantity);
  }, [selectedColor, selectedSize, productData]);

  const handleAddToCart = async (selectedColor, selectedSize, quantity, id) => {
    if (!selectedSize || !selectedColor) {
      alert("Please select both color and size.");
      return;
    }

    const email = localStorage.getItem("userEmail");
    if (!email) {
      alert("You must be logged in to add items to cart.");
      return;
    }

    const product = productData.find(
      (prod) => prod.size === selectedSize && prod.color === selectedColor
    );

    if (!product) {
      alert("Product not found!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8801/cart/addToCart", {
        email,
        product_id: product.product_id,
        quantity,
      });

      if (res.status === 200) {
        navigate("/cartPage");
      } else {
        alert("Failed to add product to cart.");
      }
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Server error while adding to cart.");
    }
  };

  const uniqueColors = [...new Set(productData.map((prod) => prod.color))];
  const sizes = ["XS", "S", "M", "L"];

  if (!productData || productData.length === 0) {
    return <div className={classes.loading}>Loading product...</div>;
  }

  // Construct the full image URL
  const productImageUrl = productData[0].image
    ? `http://localhost:8801/uploads/${productData[0].image}`
    : mensImage;

  return (
    <div className={classes.fullProduct}>
      <img
        src={productImageUrl}
        alt={productData[0].name}
        className={classes.productImg}
      />

      <div className={classes.productInfo}>
        <h2>{productData[0].name}</h2>
        <p className={classes.price}>${productData[0].price}</p>
        <p className={classes.description}>{productData[0].description}</p>

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

        <div className={classes.sizeSection}>
          <h4>Size</h4>
          <div className={classes.sizeOptions}>
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
        </div>

        <div className={classes.quantitySection}>
          {maxQuantity !== 0 ? (
            <>
              <h4>Quantity</h4>
              <div className={classes.quantityControl}>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
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
                >
                  +
                </button>
              </div>
            </>
          ) : (
            selectedColor !== "" && selectedSize !== "" && <p>Out of stock</p>
          )}
        </div>

        <button
          type="button"
          className={classes.addToCart}
          disabled={!selectedSize}
          onClick={() =>
            handleAddToCart(selectedColor, selectedSize, quantity, id)
          }
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductPage;
