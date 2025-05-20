import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, size, quantity) => {
    setCartItems(prevItems => {
      // Check if item with same product ID and size exists
      const existingItemIndex = prevItems.findIndex(
        item => item.product.id === product.id && item.size === size
      );

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { product, size, quantity }];
      }
    });
  };

  const removeFromCart = (productId, size) => {
    setCartItems(prevItems =>
      prevItems.filter(
        item => !(item.product.id === productId && item.size === size)
      )
    );
  };

  const updateQuantity = (productId, size, newQuantity) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartItemsCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}