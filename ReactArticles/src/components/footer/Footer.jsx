import React from "react";
import classes from "./footer.module.css";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Footer() {
  const { user } = useAuth();

  return (
    <footer className={classes.footer}>
      <div className={classes.footer__container}>
        <div className={classes.footer__column}>
          <h3 className={classes.footer__title}>Nuvel</h3>
          <p className={classes.footer__text}>
            Discover the latest trends in fashion and explore our new
            collections. Quality clothing for every style and occasion.
          </p>
          <div className={classes.footer__social}>
            <a href="#" className={classes.footer__social_icon}>
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className={classes.footer__social_icon}>
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className={classes.footer__social_icon}>
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className={classes.footer__social_icon}>
              <i className="fab fa-pinterest-p"></i>
            </a>
          </div>
        </div>

        <div className={classes.footer__column}>
          <h4 className={classes.footer__subtitle}>Shop</h4>
          <ul className={classes.footer__links}>
            <li>
              <Link to="/">New Arrivals</Link>
            </li>
            <li>
              <Link to="/women">Women's Collection</Link>
            </li>
            <li>
              <Link to="/men">Men's Collection</Link>
            </li>
            <li>
              <Link to="/accessories">Accessories</Link>
            </li>
          </ul>
        </div>

        <div className={classes.footer__column}>
          <h4 className={classes.footer__subtitle}>Help</h4>
          <ul className={classes.footer__links}>
            <li>
              <Link to="/customerService">Customer Service</Link>
            </li>
            <li>
              <Link to={user ? (user.role === "admin" ? "/adminPage" : `/userPage/${user.email}`) : "/login"}>
                My Account
              </Link>
            </li>
          </ul>
        </div>

        <div className={classes.footer__column}>
          <h4 className={classes.footer__subtitle}>Subscribe</h4>
          <p className={classes.footer__text}>
            Subscribe to our newsletter to get updates on our latest collections
            and exclusive offers.
          </p>
          <div className={classes.footer__newsletter}>
            <input
              type="email"
              placeholder="Your email address"
              className={classes.footer__input}
            />
            <button className={classes.footer__button}>Subscribe</button>
          </div>
        </div>
      </div>

      <div className={classes.footer__bottom}>
        <p className={classes.footer__copyright}>
          {new Date().getFullYear()} Nuvel. All Rights Reserved.
        </p>
        <div className={classes.footer__policy}>
          <Link to="/">Privacy Policy</Link>
          <Link to="/">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
