import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/img/site-logo.png";
import classes from "./header.module.css";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={classes.header}>
      <div className={classes.header__container}>
        <div className={classes.header__wrap}>
          <div className={classes.logo}>
            <Link to="/">
              <img src={logo} alt="logo" />
              <span>Nuvel</span>
            </Link>
          </div>

          <div className={classes.header__mobile_toggle} onClick={toggleMenu}>
            <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
          </div>

          <nav
            className={`${classes.nav} ${isMenuOpen ? classes.nav__open : ""}`}
          >
            <ul className={classes.menu}>
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => (isActive ? classes.active : "")}
                  end
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/men"
                  className={({ isActive }) => (isActive ? classes.active : "")}
                >
                  Men
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/women"
                  className={({ isActive }) => (isActive ? classes.active : "")}
                >
                  Women
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/accessories"
                  className={({ isActive }) => (isActive ? classes.active : "")}
                >
                  Accessories
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className={classes.header__actions}>
            <a href="#" className={classes.header__action_icon}>
              <i className="fas fa-search"></i>
            </a>
            <Link to="/login" className={classes.header__action_icon}>
              <i className="fas fa-user"></i>
            </Link>
            <Link to="/cartPage" className={classes.header__action_icon}>
              <i className="fas fa-shopping-bag"></i>
              <span className={classes.cart_count}>0</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
