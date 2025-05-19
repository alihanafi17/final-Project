import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/styles/MainPage.css";
import axios from "axios";
import classes from "./mainPage.module.css";
import womensImage from "../../assets/img/womensCollectionCover.jpg";
import mensImage from "../../assets/img/mensCollectionCover.jpg";
import heroBackground from "../../assets/img/1.jpg";
import newSeasonCover from "../../assets/img/newSeasonCover.jpg";
import ProductPage from "../productPage/ProductPage";
import ProductShow from "../productShow/ProductShow";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  const navigate = useNavigate();

  // const [msg, setMsg] = useState("");

  const fetchData = () => {
    axios
      .get("/products")
      .then((res) => {
        setProducts(res.data);
        console.log(res.data); // Data from API
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // const handleDelete = (post) => {
  //   if (window.confirm(`Are you sure you want to delete post: ${post.name}`)) {
  //     axios
  //       .delete(`/users/${post.email}`)
  //       .then((res) => {
  //         console.log("Post deleted:", res.data); // Article deleted
  //         // After deletion, update the list of articles
  //         setUsers(users.filter((user) => user.id !== post.id));
  //         setMsg("user was deleted");
  //         // Clear the message after 1 second
  //         setTimeout(() => {
  //           setMsg(""); // Clear the message after 1 second
  //         }, 2000); // 1000 ms = 1 second
  //       })
  //       .catch((error) => {
  //         console.error("Error:", error);
  //       });
  //   }
  // };
  return (
    <div className={classes.main}>
      <section className={classes.section1}>
        <h1>New Season</h1>
        <p>
          Discover our latest arrivals crafted with premium materials and
          timeless designs. Elevate your wardrobe with pieces that blend
          comfort, style, and sustainability.
        </p>
        <div className={classes.btns}>
          <button onClick={() => navigate("/men")}>Shop Men</button>
          <button onClick={() => navigate("/women")}>Shop Women</button>
        </div>
      </section>
      <section className={classes.section2}>
        <h1>Featured Products</h1>
        <p className={classes.featuredSubtitle}>
          Our handpicked selection just for you
        </p>
        <div className={classes.FeaturedProducts}>
          {products
            .sort(() => 0.5 - Math.random()) // Randomly shuffle the products array
            .slice(0, 5) // Take only the first 5 products
            .map((product) => (
              <ProductShow
                key={crypto.randomUUID()}
                product={product}
                featured={true}
              />
            ))}
        </div>
      </section>
      <section className={classes.section3}>
        <img src={womensImage} alt="Women's Collection" />
        <div>
          <h2>Women's collection</h2>
          <p>
            Explore our curated women's collection featuring elegant silhouettes
            and versatile pieces designed to empower your personal style for
            every occasion.
          </p>
        </div>
      </section>
      <section className={classes.section4}>
        <div>
          <h2>Men's collection</h2>
          <p>
            Discover refined essentials for the modern man, combining
            exceptional craftsmanship with contemporary design for effortless,
            sophisticated style.
          </p>
        </div>
        <img src={mensImage} alt="Men's Collection" />
      </section>
    </div>
  );
}

export default MainPage;
