import React from "react";
import { Routes, Route } from "react-router-dom";
import MainPage from "./mainPage/MainPage";
import { useEffect, useState } from "react";
import axios from "axios";
import { AuthProvider } from "./AuthContext";

import Header from "./header/Header";
import Footer from "./footer/Footer";
import SinglePost from "./SinglePost";
import MenCollection from "./menCollection/MenCollection";
import WomenCollection from "./womenCollection/WomenCollection";
import Accessories from "./accessories/Accessories";
import ProductPage from "./productPage/ProductPage";
import Login from "./login/Login";
import AdminPage from "./adminPage/AdminPage";
import UserPage from "./userPage/UserPage";
import RegisterPage from "./registerPage/RegisterPage";
import ForgotPassword from "./forgotPassword/ForgotPassword";
import CustomerService from "./customerService/CustomerService";

function MyRoutes() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get("/users")
      .then((res) => {
        setUsers(res.data);
        console.log(res.data);
      })
      .catch((error) => {
        console.error("Users fetch error:", error);
      });
  };

  const fetchData = () => {
    axios
      .get("/products")
      .then((res) => {
        setProducts(res.data);
        console.log(res.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/men" element={<MenCollection products={products} />} />
        <Route path="/women" element={<WomenCollection products={products} />} />
        <Route path="/accessories" element={<Accessories products={products} />} />
        <Route path="/products/:id" element={<ProductPage products={products} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/adminPage" element={<AdminPage />} />
        <Route path="/userPage/:email" element={<UserPage info={users} />} />
        <Route path="/registerPage" element={<RegisterPage />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/customerService" element={<CustomerService />} />
      </Routes>
      <Footer />
    </AuthProvider>
  );
}

export default MyRoutes;
