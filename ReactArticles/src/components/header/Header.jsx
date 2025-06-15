import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/img/site-logo.png";
import classes from "./header.module.css";
import { useAuth } from "../AuthContext";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className={classes.header}>
      <div className={classes.header__container}>
        <div className={classes.header__wrap}>
          <div className={classes.logo}>
            <Link to="/">
              <img src={logo} alt="logo" />
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
            <Link to="/search" className={classes.header__action_icon} title="Search">
              <i className="fas fa-search"></i>
            </Link>

            {user ? (
              <>
                <Link 
                  to={user.role === "admin" ? "/adminPage" : `/userPage/${user.email}`} 
                  className={classes.header__action_icon}
                >
                  <i className="fas fa-user"></i>
                </Link>
                <Link
                  onClick={handleLogout}
                  to="#"
                  className={classes.header__action_icon}
                  title="Logout"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </Link>
              </>
            ) : (
              <Link to="/login" className={classes.header__action_icon}>
                <i className="fas fa-user"></i>
              </Link>
            )}

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
