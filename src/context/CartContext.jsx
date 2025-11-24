import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('carrito');
      return localData ? JSON.parse(localData) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- AQUÍ LA CORRECCIÓN ---
  const addToCart = (product) => {
    const id = product.id || product.idProducto;
    
    // Primero, verificamos si el item ya existe
    const existingItem = cartItems.find(item => (item.id || item.idProducto) === id);

    if (existingItem) {
        // Si ya existe, solo mostramos el toast. NO actualizamos el estado.
        toast('Ya está en el carrito', { icon: '🛒', id: `cart-exists-${id}` });
    } else {
        // Si es nuevo, mostramos el toast Y LUEGO actualizamos el estado.
        toast.success(`Añadido: ${product.nombre || 'Producto'}`, { id: `cart-added-${id}` });
        setCartItems(prevItems => [...prevItems, { ...product, id, cantidad: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => (item.id || item.idProducto) !== productId));
    toast('Eliminado del carrito', { icon: '🗑️' });
  };
  
  const updateQuantity = (productId, newQuantity) => {
    setCartItems(prevItems => {
        return prevItems.map(item => {
            const id = item.id || item.idProducto;
            if (id === productId) {
                if (newQuantity > item.stock) {
                    toast.error(`Stock máximo alcanzado: ${item.stock}`);
                    return { ...item, cantidad: item.stock };
                }
                if (newQuantity < 1) {
                    return item;
                }
                return { ...item, cantidad: newQuantity };
            }
            return item;
        });
    });
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success('Carrito vacío');
  };

  const cartCount = cartItems.reduce((count, item) => count + (item.cantidad || 0), 0);

  const value = { cartItems, addToCart, removeFromCart, clearCart, cartCount, updateQuantity };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);