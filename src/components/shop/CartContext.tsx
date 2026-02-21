// // CartContext.tsx
// import { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { GetUserCart, AddToCart, UpdateCartItem, DeleteCartItem } from "@/api/cartApi";
// import { CartItem as ApiCartItem, UserCart } from "@/lib/schemas/cartitems/cartitems";
// import { useAuthStore } from "@/context/userContext";

// // Context type
// interface CartContextType {
//   cartItems: ApiCartItem[];
//   addToCart: (product: ApiCartItem & { img?: string }, quantity?: number) => void;
//   removeFromCart: (productId: string | number) => void;
//   updateQuantity: (productId: string | number, newQuantity: number) => void;
//   getCartTotal: () => number;
//   getCartItemsCount: () => number;
//   clearCart: () => void;
//   loading: boolean;
//   error: string | null;
// }

// // Create context
// const CartContext = createContext<CartContextType | undefined>(undefined);

// // Hook to use context
// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) throw new Error("useCart must be used within a CartProvider");
//   return context;
// };

// // Provider props
// interface CartProviderProps {
//   children: ReactNode;
// }

// // CartProvider implementation
// export const CartProvider = ({ children }: CartProviderProps) => {
//   const [cartItems, setCartItems] = useState<ApiCartItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { user, token } = useAuthStore();

//   // Fetch cart on mount or user/token change
//   useEffect(() => {
//     const fetchCart = async () => {
//       if (!user || !token) {
//         setCartItems([]);
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       try {
//         const userCart: UserCart = await GetUserCart(user.id);
//         // Ensure every item has quantity
//         const cartWithQuantity = userCart.cart.map(item => ({
//           ...item,
//           quantity: item.quantity || 1
//         }));
//         setCartItems(cartWithQuantity);
//         setError(null);
//       } catch (err) {
//         console.error("Failed to fetch cart:", err);
//         setError("Failed to fetch cart. Please try again.");
//         setCartItems([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCart();
//   }, [user, token]);

//   // Add item to cart
//   const addToCart = async (product: ApiCartItem & { img?: string }, quantity: number = 1) => {
//     if (!user || !token) {
//       setError("You must be logged in to add items to the cart.");
//       return;
//     }
//     setError(null);

//     const prevCart = [...cartItems]; // save previous state
//     const existingItem = cartItems.find(item => item.id === product.id);

//     // Optimistic update
//     if (existingItem) {
//       setCartItems(prev =>
//         prev.map(item =>
//           item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
//         )
//       );
//     } else {
//       setCartItems(prev => [...prev, { ...product, quantity }]);
//     }

//     try {
//       await AddToCart(user.id, product.id, quantity);
//     } catch (err) {
//       console.error("Failed to add to cart on API:", err);
//       setError("Failed to add item. Restoring previous cart.");
//       setCartItems(prevCart); // restore previous state
//     }
//   };

//   // Remove item from cart
//   const removeFromCart = async (productId: string | number) => {
//     if (!user || !token) {
//       setError("You must be logged in to modify your cart.");
//       return;
//     }
//     setError(null);

//     const prevCart = [...cartItems];
//     const itemToRemove = cartItems.find(item => item.id === productId);
//     setCartItems(prev => prev.filter(item => item.id !== productId));

//     try {
//       await DeleteCartItem(user.id, productId);
//     } catch (err) {
//       console.error("Failed to remove from cart on API:", err);
//       setError("Failed to remove item. Restoring previous cart.");
//       if (itemToRemove) setCartItems(prevCart);
//     }
//   };

//   // Update quantity
//   const updateQuantity = async (productId: string | number, newQuantity: number) => {
//     if (!user || !token) {
//       setError("You must be logged in to modify your cart.");
//       return;
//     }

//     if (newQuantity <= 0) {
//       await removeFromCart(productId);
//       return;
//     }

//     setError(null);
//     const prevCart = [...cartItems];
//     const itemToUpdate = cartItems.find(item => item.id === productId);

//     setCartItems(prev =>
//       prev.map(item => (item.id === productId ? { ...item, quantity: newQuantity } : item))
//     );

//     try {
//       await UpdateCartItem(user.id, productId, newQuantity);
//     } catch (err) {
//       console.error("Failed to update quantity on API:", err);
//       setError("Failed to update quantity. Restoring previous value.");
//       if (itemToUpdate) setCartItems(prevCart);
//     }
//   };

//   // Total price
//   const getCartTotal = () =>
//     cartItems.reduce((total, item) => {
//       const price = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
//       return total + price * item.quantity;
//     }, 0);

//   // Total count
//   const getCartItemsCount = () =>
//     cartItems.reduce((total, item) => total + item.quantity, 0);

//   // Clear cart
//   const clearCart = async () => {
//     if (!user || !token) {
//       setError("You must be logged in to clear your cart.");
//       return;
//     }

//     setError(null);
//     const prevCart = [...cartItems];
//     setCartItems([]);

//     try {
//       // TODO: Call API to clear cart
//     } catch (err) {
//       console.error("Failed to clear cart on API:", err);
//       setError("Failed to clear cart.");
//       const userCart = await GetUserCart(user.id);
//       setCartItems(userCart.cart);
//     }
//   };

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//         getCartTotal,
//         getCartItemsCount,
//         clearCart,
//         loading,
//         error,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };














// import { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { GetUserCart, AddToCart, UpdateCartItem, DeleteCartItem } from "@/api/cartApi"; 
// import { CartItem as ApiCartItem, UserCart } from "@/lib/schemas/cartitems/cartitems";
// import { useAuthStore } from "@/context/userContext";
// import { CartContextType } from "@/components/interfaces/cart";

// // Create context
// const CartContext = createContext<CartContextType | undefined>(undefined);

// // Hook to use context
// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) throw new Error("useCart must be used within a CartProvider");
//   return context;
// };

// // Provider props
// interface CartProviderProps {
//   children: ReactNode;
// }

// export const CartProvider = ({ children }: CartProviderProps) => {
//   const [cart, setCart] = useState<ApiCartItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { user, token } = useAuthStore();

//   // Fetch cart on mount or when user/token changes
//   useEffect(() => {
//     const fetchCart = async () => {
//       if (!user || !token) {
//         setCart([]);
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       try {
//         const userCart: UserCart = await GetUserCart(user.id);
//         const cartWithQuantity = userCart.cart.map(item => ({
//           ...item,
//           quantity: item.quantity || 1,
//         }));
//         setCart(cartWithQuantity);
//         setError(null);
//       } catch (err) {
//         console.error("Failed to fetch cart:", err);
//         setError("Failed to fetch cart. Please try again.");
//         setCart([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCart();
//   }, [user, token]);

//   // Add item to cart
//   const addToCart = async (product: ApiCartItem, quantity: number = 1) => {
//     if (!user || !token) {
//       setError("You must be logged in to add items.");
//       return;
//     }

//     setError(null);
//     const prevCart = [...cart];
//     const existingItem = cart.find(item => item.product_id === product.product_id);

//     // optimistic UI update
//     if (existingItem) {
//       setCart(prev =>
//         prev.map(item =>
//           item.product_id === product.product_id ? { ...item, quantity: item.quantity + quantity } : item
//         )
//       );
//     } else {
//       setCart(prev => [...prev, { ...product, quantity }]);
//     }

//     try {
//       await AddToCart(user.id, product.product_id, quantity);
//     } catch (err) {
//       console.error("Failed to add to cart:", err);
//       setError("Failed to add item. Restoring previous cart.");
//       setCart(prevCart);
//     }
//   };

//   // Remove item
//   const removeFromCart = async (cartItemId: number) => {
//     if (!user || !token) {
//       setError("You must be logged in to remove items.");
//       return;
//     }

//     const prevCart = [...cart];
//     setCart(prev => prev.filter(item => item.id !== cartItemId));

//     try {
//       await DeleteCartItem(user.id, cartItemId);
//     } catch (err) {
//       console.error("Failed to remove item:", err);
//       setError("Failed to remove item. Restoring previous cart.");
//       setCart(prevCart);
//     }
//   };

//   // Update quantity
//   const updateQuantity = async (cartItemId: number, newQuantity: number) => {
//     if (!user || !token) {
//       setError("You must be logged in to update items.");
//       return;
//     }

//     if (newQuantity <= 0) {
//       await removeFromCart(cartItemId);
//       return;
//     }

//     const prevCart = [...cart];
//     setCart(prev =>
//       prev.map(item => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
//     );

//     try {
//       await UpdateCartItem(user.id, cartItemId, newQuantity);
//     } catch (err) {
//       console.error("Failed to update quantity:", err);
//       setError("Failed to update quantity. Restoring previous cart.");
//       setCart(prevCart);
//     }
//   };

//   // Total price
//   const getCartTotal = () =>
//     cart.reduce((total, item) => {
//       const price = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
//       return total + price * item.quantity;
//     }, 0);

//   // Total count
//   const getCartItemsCount = () =>
//     cart.reduce((total, item) => total + item.quantity, 0);

//   const clearCart = () => setCart([]);

//   const contextValue = {
//     userId: user?.id ?? 0,
//     cart,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     getCartTotal,
//     getCartItemsCount,
//     clearCart,
//     loading,
//     error,
//   };

//   return (
//     <CartContext.Provider value={contextValue}>
//       {children}
//     </CartContext.Provider>
//   );
// };





// import { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { GetUserCart, AddToCart, UpdateCartItem, DeleteCartItem } from "@/api/cartApi";
// import { CartItem, CartContextType } from "@/components/interfaces/cart";
// import { useAuthStore } from "@/context/userContext";

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) throw new Error("useCart must be used within a CartProvider");
//   return context;
// };

// interface CartProviderProps {
//   children: ReactNode;
// }

// export const CartProvider = ({ children }: CartProviderProps) => {
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { user, token } = useAuthStore();

//   useEffect(() => {
//     const fetchCart = async () => {
//       if (!user || !token) {
//         setCart([]);
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       try {
//         const userCart = await GetUserCart(user.id);
//         const cartItems = userCart.cart.map(item => ({
//           id: item.id,
//           user_id: item.user_id,
//           product_id: item.product_id,
//           quantity: item.quantity || 1,
//           price: item.price,
//           created_at: item.created_at,
//           updated_at: item.updated_at,
//         }));
//         setCart(cartItems);
//         setError(null);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to fetch cart. Please try again.");
//         setCart([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCart();
//   }, [user, token]);

//   const addToCart = async (productId: number, quantity: number = 1, price: string) => {
//   if (!user || !token) {
//     setError("You must be logged in to add items.");
//     return;
//   }

//   setError(null);
//   console.log('Adding to cart:', { userId: user.id, productId, quantity, price }); // Debug log

//   const existingItem = cart.find(item => item.product_id === productId);

//   // Optimistically update the UI
//   if (existingItem) {
//     setCart(prev =>
//       prev.map(item =>
//         item.product_id === productId 
//           ? { ...item, quantity: item.quantity + quantity } 
//           : item
//       )
//     );
//   } else {
//     const tempCartItem: CartItem = {
//       id: Date.now(),
//       user_id: user.id,
//       product_id: productId,
//       quantity,
//       price,
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//     };
//     setCart(prev => [...prev, tempCartItem]);
//   }

//   try {
//     console.log('Calling API with:', { userId: user.id, productId, quantity }); // Debug log
//     const addedItem = await AddToCart(user.id, productId, quantity);
//     console.log('API Response:', addedItem); // Debug log
    
//     // Update with the actual item from backend
//     setCart(prev => {
//       const filtered = prev.filter(item => 
//         !(item.product_id === productId && item.id === Date.now())
//       );
      
//       const existingIndex = filtered.findIndex(item => item.product_id === productId);
      
//       if (existingIndex >= 0) {
//         const updated = [...filtered];
//         updated[existingIndex] = addedItem;
//         return updated;
//       } else {
//         return [...filtered, addedItem];
//       }
//     });
//   } catch (err) {
//     console.error('Add to cart error details:', err); // Better error logging
    
//     // Log the full error object
//     if (err instanceof Error) {
//       console.error('Error message:', err.message);
//       console.error('Error stack:', err.stack);
//     }
    
//     setError(`Failed to add item to cart: ${err instanceof Error ? err.message : 'Unknown error'}`);
    
//     // Revert the optimistic update
//     try {
//       const userCart = await GetUserCart(user.id);
//       const cartItems = userCart.cart.map(item => ({
//         id: item.id,
//         user_id: item.user_id,
//         product_id: item.product_id,
//         quantity: item.quantity || 1,
//         price: item.price,
//         created_at: item.created_at,
//         updated_at: item.updated_at,
//       }));
//       setCart(cartItems);
//     } catch (fetchErr) {
//       console.error('Failed to revert cart:', fetchErr);
//       setCart([]);
//     }
    
//     throw err; // Re-throw so the component can handle it
//   }
// };

//   const removeFromCart = async (cartItemId: number) => {
//     if (!user || !token) {
//       setError("You must be logged in to remove items.");
//       return;
//     }

//     const prevCart = [...cart];
//     setCart(prev => prev.filter(item => item.id !== cartItemId));

//     try {
//       await DeleteCartItem(user.id, cartItemId);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to remove item. Restoring previous cart.");
//       setCart(prevCart);
//     }
//   };

//   const updateQuantity = async (cartItemId: number, newQuantity: number) => {
//     if (!user || !token) {
//       setError("You must be logged in to update items.");
//       return;
//     }

//     if (newQuantity <= 0) {
//       await removeFromCart(cartItemId);
//       return;
//     }

//     const prevCart = [...cart];
//     setCart(prev =>
//       prev.map(item => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
//     );

//     try {
//       const updatedItem = await UpdateCartItem(user.id, cartItemId, newQuantity);
//       setCart(prev =>
//         prev.map(item =>
//           item.id === updatedItem.id ? updatedItem : item
//         )
//       );
//     } catch (err) {
//       console.error(err);
//       setError("Failed to update quantity. Restoring previous cart.");
//       setCart(prevCart);
//     }
//   };

//   const getCartTotal = () =>
//     cart.reduce((total, item) => {
//       const price = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
//       return total + price * item.quantity;
//     }, 0);

//   const getCartItemsCount = () => cart.reduce((total, item) => total + item.quantity, 0);

//   const clearCart = () => setCart([]);

//   const contextValue: CartContextType = {
//     userId: user?.id ?? 0,
//     cart,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     getCartTotal,
//     getCartItemsCount,
//     clearCart,
//     loading,
//     error,
//   };

//   return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
// };




// import { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { GetUserCart, AddToCart, UpdateCartItem, DeleteCartItem } from "@/api/cartApi";
// import { CartItem, CartContextType } from "@/components/interfaces/cart";
// import { useAuthStore } from "@/context/userContext";

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) throw new Error("useCart must be used within a CartProvider");
//   return context;
// };

// interface CartProviderProps {
//   children: ReactNode;
// }

// export const CartProvider = ({ children }: CartProviderProps) => {
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { user, token } = useAuthStore();

//   useEffect(() => {
//     const fetchCart = async () => {
//       if (!user || !token) {
//         setCart([]);
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       try {
//         const userCart = await GetUserCart(user.id);
//         console.log('Fetched cart data:', userCart);
        
//         const cartItems = (userCart.items || []).map(item => ({
//           id: item.id,
//           user_id: item.user_id,
//           product_id: item.product_id,
//           quantity: item.quantity || 1,
//           price: item.price,
//           created_at: item.created_at,
//           updated_at: item.updated_at,
//         }));
        
//         setCart(cartItems);
//         setError(null);
//       } catch (err) {
//         console.error('Fetch cart error:', err);
//         setError("Failed to fetch cart. Please try again.");
//         setCart([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCart();
//   }, [user, token]);

//   // ✅ Fix the function signature to match interface
//   const addToCart = async (productId: number, quantity: number = 1, price: string = "0") => {
//     if (!user || !token) {
//       setError("You must be logged in to add items.");
//       return;
//     }

//     setError(null);
//     console.log('Adding to cart:', { userId: user.id, productId, quantity, price });

//     try {
//       console.log('Calling API with:', { userId: user.id, productId, quantity });
//       const addedItem = await AddToCart(user.id, productId, quantity);
//       console.log('API Response:', addedItem);
      
//       // ✅ After successful API call, refresh the cart from backend
//       const userCart = await GetUserCart(user.id);
//       const cartItems = (userCart.items || []).map(item => ({
//         id: item.id,
//         user_id: item.user_id,
//         product_id: item.product_id,
//         quantity: item.quantity || 1,
//         price: item.price,
//         created_at: item.created_at,
//         updated_at: item.updated_at,
//       }));
//       setCart(cartItems);
      
//     } catch (err) {
//       console.error('Add to cart error details:', err);
      
//       if (err instanceof Error) {
//         console.error('Error message:', err.message);
//         setError(err.message); // ✅ Show the actual error message from backend
//       } else {
//         setError('Failed to add item to cart');
//       }
      
//       throw err;
//     }
//   };

//   const removeFromCart = async (cartItemId: number) => {
//     if (!user || !token) {
//       setError("You must be logged in to remove items.");
//       return;
//     }

//     try {
//       await DeleteCartItem(user.id, cartItemId);
//       // Refresh cart after successful deletion
//       const userCart = await GetUserCart(user.id);
//       const cartItems = (userCart.items || []).map(item => ({
//         id: item.id,
//         user_id: item.user_id,
//         product_id: item.product_id,
//         quantity: item.quantity || 1,
//         price: item.price,
//         created_at: item.created_at,
//         updated_at: item.updated_at,
//       }));
//       setCart(cartItems);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to remove item.");
//     }
//   };

//   const updateQuantity = async (cartItemId: number, newQuantity: number) => {
//     if (!user || !token) {
//       setError("You must be logged in to update items.");
//       return;
//     }

//     if (newQuantity <= 0) {
//       await removeFromCart(cartItemId);
//       return;
//     }

//     try {
//       await UpdateCartItem(user.id, cartItemId, newQuantity);
//       // Refresh cart after successful update
//       const userCart = await GetUserCart(user.id);
//       const cartItems = (userCart.items || []).map(item => ({
//         id: item.id,
//         user_id: item.user_id,
//         product_id: item.product_id,
//         quantity: item.quantity || 1,
//         price: item.price,
//         created_at: item.created_at,
//         updated_at: item.updated_at,
//       }));
//       setCart(cartItems);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to update quantity.");
//     }
//   };

//   const getCartTotal = () =>
//     cart.reduce((total, item) => {
//       const price = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
//       return total + price * item.quantity;
//     }, 0);

//   const getCartItemsCount = () => cart.reduce((total, item) => total + item.quantity, 0);

//   const clearCart = () => setCart([]);

//   const contextValue: CartContextType = {
//     userId: user?.id ?? 0,
//     cart,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     getCartTotal,
//     getCartItemsCount,
//     clearCart,
//     loading,
//     error,
//   };

//   return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
// };










// import { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { GetUserCart, AddToCart, UpdateCartItem, DeleteCartItem } from "@/api/cartApi";
// import { CartItem, CartContextType } from "@/components/interfaces/cart";
// import { useAuthStore } from "@/context/userContext";

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) throw new Error("useCart must be used within a CartProvider");
//   return context;
// };

// interface CartProviderProps {
//   children: ReactNode;
// }

// export const CartProvider = ({ children }: CartProviderProps) => {
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { user, token } = useAuthStore();

//   useEffect(() => {
//     const fetchCart = async () => {
//       if (!user || !token) {
//         setCart([]);
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       try {
//         const userCart = await GetUserCart(user.id);
//         console.log('Fetched cart data:', userCart);
        
//         const cartItems = (userCart.items || []).map(item => ({
//           id: item.id,
//           user_id: item.user_id,
//           product_id: item.product_id,
//           quantity: item.quantity || 1,
//           price: item.price,
//           created_at: item.created_at,
//           updated_at: item.updated_at,
//         }));
        
//         setCart(cartItems);
//         setError(null);
//       } catch (err) {
//         console.error('Fetch cart error:', err);
//         setError("Failed to fetch cart. Please try again.");
//         setCart([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCart();
//   }, [user, token]);

//   const addToCart = async (productId: number, quantity: number = 1, price: string = "0") => {
//     if (!user || !token) {
//       const errorMsg = "You must be logged in to add items.";
//       setError(errorMsg);
//       throw new Error(errorMsg);
//     }

//     setError(null);
//     console.log('Adding to cart:', { userId: user.id, productId, quantity, price });

//     try {
//       // Remove frontend stock check - let backend handle all validation
//       console.log('Calling API with:', { userId: user.id, productId, quantity });
//       const addedItem = await AddToCart(user.id, productId, quantity);
//       console.log('API Response:', addedItem);
      
//       // Refresh the cart from backend
//       const userCart = await GetUserCart(user.id);
//       const cartItems = (userCart.items || []).map(item => ({
//         id: item.id,
//         user_id: item.user_id,
//         product_id: item.product_id,
//         quantity: item.quantity || 1,
//         price: item.price,
//         created_at: item.created_at,
//         updated_at: item.updated_at,
//       }));
//       setCart(cartItems);
      
//     } catch (err) {
//       console.error('Add to cart error details:', err);
      
//       if (err instanceof Error) {
//         console.error('Error message:', err.message);
//         setError(err.message);
//       } else {
//         const errorMsg = 'Failed to add item to cart';
//         setError(errorMsg);
//         throw new Error(errorMsg);
//       }
      
//       throw err;
//     }
//   };

//   const removeFromCart = async (cartItemId: number) => {
//     if (!user || !token) {
//       setError("You must be logged in to remove items.");
//       return;
//     }

//     try {
//       await DeleteCartItem(user.id, cartItemId);
//       // Refresh cart after successful deletion
//       const userCart = await GetUserCart(user.id);
//       const cartItems = (userCart.items || []).map(item => ({
//         id: item.id,
//         user_id: item.user_id,
//         product_id: item.product_id,
//         quantity: item.quantity || 1,
//         price: item.price,
//         created_at: item.created_at,
//         updated_at: item.updated_at,
//       }));
//       setCart(cartItems);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to remove item.");
//     }
//   };

//   const updateQuantity = async (cartItemId: number, newQuantity: number) => {
//     if (!user || !token) {
//       setError("You must be logged in to update items.");
//       return;
//     }

//     if (newQuantity <= 0) {
//       await removeFromCart(cartItemId);
//       return;
//     }

//     try {
//       await UpdateCartItem(user.id, cartItemId, newQuantity);
//       // Refresh cart after successful update
//       const userCart = await GetUserCart(user.id);
//       const cartItems = (userCart.items || []).map(item => ({
//         id: item.id,
//         user_id: item.user_id,
//         product_id: item.product_id,
//         quantity: item.quantity || 1,
//         price: item.price,
//         created_at: item.created_at,
//         updated_at: item.updated_at,
//       }));
//       setCart(cartItems);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to update quantity.");
//     }
//   };

//   const getCartTotal = () =>
//     cart.reduce((total, item) => {
//       const price = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
//       return total + price * item.quantity;
//     }, 0);

//   const getCartItemsCount = () => cart.reduce((total, item) => total + item.quantity, 0);

//   const clearCart = () => setCart([]);

//   const contextValue: CartContextType = {
//     userId: user?.id ?? 0,
//     cart,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     getCartTotal,
//     getCartItemsCount,
//     clearCart,
//     loading,
//     error,
//   };

//   return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
// };








// jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj

// import { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { GetUserCart, AddToCart, UpdateCartItem, DeleteCartItem } from "@/api/cartApi";
// import { CartItem, CartContextType } from "@/components/interfaces/cart";
// import { useAuthStore } from "@/context/userContext";

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export const useCart = () => {
//   const context = useContext(CartContext);
//   if (!context) throw new Error("useCart must be used within a CartProvider");
//   return context;
// };

// interface CartProviderProps {
//   children: ReactNode;
// }

// export const CartProvider = ({ children }: CartProviderProps) => {
//    const [cart, setCart] = useState<CartItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { user, token } = useAuthStore();

//   // ✅ Define fetchCart function
//   const fetchCart = async () => {
//     if (!user || !token) {
//       setCart([]);
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     try {
//       const userCart = await GetUserCart(user.id);
//       console.log('Fetched cart data:', userCart);
      
//       const cartItems = (userCart.items || []).map(item => ({
//         id: item.id,
//         user_id: item.user_id,
//         product_id: item.product_id,
//         quantity: item.quantity || 1,
//         price: item.price,
//         created_at: item.created_at,
//         updated_at: item.updated_at,
//       }));
      
//       setCart(cartItems);
//       setError(null);
//     } catch (err) {
//       console.error('Fetch cart error:', err);
//       setError("Failed to fetch cart. Please try again.");
//       setCart([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCart();
//   }, [user, token]);

  







//   const addToCart = async (productId: number, quantity: number) => {
//   if (!user?.id) {
//     const errorMsg = "User not logged in";
//     setError(errorMsg);
//     return { success: false, error: errorMsg };
//   }

//   try {
//     const result = await AddToCart(user.id, productId, quantity); // Pass userId
//     console.log("Cart updated:", result);
    
//     await fetchCart(); // Refresh cart data
//     return { success: true };
//   } catch (error: any) {
//     console.error("Error adding to cart:", error);
//     const errorMsg = error.response?.data?.error || error.message || "Failed to add to cart";
//     setError(errorMsg);
//     return { success: false, error: errorMsg };
//   }
// };

// const removeFromCart = async (cartItemId: number) => {
//   if (!user?.id || !token) {
//     const errorMsg = "You must be logged in to remove items.";
//     setError(errorMsg);
//     return { success: false, error: errorMsg };
//   }

//   try {
//     await DeleteCartItem(user.id, cartItemId); // Pass userId
//     await fetchCart(); // Refresh cart
//     return { success: true };
//   } catch (err: any) {
//     console.error(err);
//     const errorMsg = err.response?.data?.error || "Failed to remove item.";
//     setError(errorMsg);
//     return { success: false, error: errorMsg };
//   }
// };

// const updateQuantity = async (cartItemId: number, newQuantity: number) => {
//   if (!user?.id || !token) {
//     const errorMsg = "You must be logged in to update items.";
//     setError(errorMsg);
//     return { success: false, error: errorMsg };
//   }

//   if (newQuantity <= 0) {
//     return await removeFromCart(cartItemId);
//   }

//   try {
//     await UpdateCartItem(user.id, cartItemId, newQuantity); // Pass userId
//     await fetchCart(); // Refresh cart
//     return { success: true };
//   } catch (err: any) {
//     console.error(err);
//     const errorMsg = err.response?.data?.error || "Failed to update quantity.";
//     setError(errorMsg);
//     return { success: false, error: errorMsg };
//   }
// };
//   // inside CartContext.tsx

  

//   const getCartTotal = () =>
//     cart.reduce((total, item) => {
//       const price = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
//       return total + price * item.quantity;
//     }, 0);

//   const getCartItemsCount = () => cart.reduce((total, item) => total + item.quantity, 0);

//   const clearCart = () => setCart([]);

//   const clearError = () => setError(null);

//   const contextValue: CartContextType = {
//     userId: user?.id ?? 0,
//     cart,
//     addToCart,
//     removeFromCart,
//     updateQuantity,
//     getCartTotal,
//     getCartItemsCount,
//     clearCart,
//     loading,
//     error,
//     clearError,
//   };

//   return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
// };

// jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj






import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { GetUserCart, AddToCart, UpdateCartItem, DeleteCartItem } from "@/api/cartApi";
import { GetProductById } from "@/api/productApi";
import { CartItem, CartContextType } from "@/components/interfaces/cart";
import { useAuthStore } from "@/context/userContext";

const LOCAL_CART_KEY = "dimbo_guest_cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuthStore();

  // ✅ Updated fetchCart to get full product data including stock
  const fetchCart = useCallback(async () => {
    // Authenticated Mode
    if (user?.id && token) {
      setLoading(true);
      try {
        const userCart = await GetUserCart(user.id);
        console.log('Fetched authenticated cart:', userCart);
        setCart(userCart.items || []);
        setError(null);
      } catch (err) {
        console.error('Fetch authenticated cart error:', err);
        setError("Failed to fetch cart. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Guest Mode (localStorage)
    setLoading(true);
    try {
      const storedCart = localStorage.getItem(LOCAL_CART_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCart(parsedCart);
      } else {
        setCart([]);
      }
      setError(null);
    } catch (err) {
      console.error('Fetch guest cart error:', err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Sync guest cart to server on login
  useEffect(() => {
    const syncCart = async () => {
      if (user?.id && token) {
        const storedCart = localStorage.getItem(LOCAL_CART_KEY);
        if (storedCart) {
          try {
            const guestCart = JSON.parse(storedCart);
            if (guestCart.length > 0) {
              console.log("Syncing guest cart to server...");
              // Add all guest items to server
              for (const item of guestCart) {
                await AddToCart(user.id, item.product_id, item.quantity);
              }
              // Clear guest cart
              localStorage.removeItem(LOCAL_CART_KEY);
              // Refresh full cart from server
              await fetchCart();
            }
          } catch (err) {
            console.error("Failed to sync guest cart:", err);
          }
        }
      }
    };

    syncCart();
  }, [user?.id, token, fetchCart]);

  const addToCart = async (productId: number, quantity: number = 1, _price?: string) => {
    setError(null);
    
    // Authenticated Mode
    if (user?.id && token) {
      try {
        const result = await AddToCart(user.id, productId, quantity);
        console.log("API Cart updated:", result);
        await fetchCart();
        return { success: true };
      } catch (error: any) {
        console.error("Error adding to API cart:", error);
        const errorMsg = error.response?.data?.error || error.message || "Failed to add to cart";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    // Guest Mode
    try {
      setLoading(true);
      const guestCart = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || "[]");
      const existingItemIndex = guestCart.findIndex((item: CartItem) => item.product_id === productId);

      if (existingItemIndex > -1) {
        guestCart[existingItemIndex].quantity += quantity;
        guestCart[existingItemIndex].updated_at = new Date().toISOString();
      } else {
        // Fetch product details for the new guest item
        const product = await GetProductById(productId.toString());
        
        const newItem: CartItem = {
          id: Date.now(), // Temporary ID for guest
          user_id: null,
          product_id: productId,
          quantity: quantity,
          price: product.price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          products: {
            id: product.id,
            name: product.name,
            description: product.description || "",
            price: product.price,
            stock_quantity: product.stock_quantity,
            category_id: product.category_id,
            image_url: product.image_url,
            created_at: product.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            discount_percentage: product.discount_percentage || 0,
            views: product.views || 0,
            categories: {
              id: product.categories?.id || 0,
              name: product.categories?.name || "Category"
            }
          }
        };
        guestCart.push(newItem);
      }

      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(guestCart));
      setCart(guestCart);
      return { success: true };
    } catch (error: any) {
      console.error("Error adding to guest cart:", error);
      const errorMsg = "Failed to add item to guest cart";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    setError(null);

    // Authenticated Mode
    if (user?.id && token) {
      try {
        await DeleteCartItem(user.id, cartItemId);
        await fetchCart();
        return { success: true };
      } catch (err: any) {
        console.error("Error removing from API cart:", err);
        const errorMsg = err.response?.data?.error || "Failed to remove item.";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    // Guest Mode
    try {
      const guestCart = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || "[]");
      const updatedCart = guestCart.filter((item: CartItem) => item.id !== cartItemId);
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(updatedCart));
      setCart(updatedCart);
      return { success: true };
    } catch (err) {
      setError("Failed to remove item from guest cart");
      return { success: false, error: "Failed to remove item" };
    }
  };

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    setError(null);
    if (newQuantity <= 0) return await removeFromCart(cartItemId);

    // Authenticated Mode
    if (user?.id && token) {
      try {
        await UpdateCartItem(user.id, cartItemId, newQuantity);
        await fetchCart();
        return { success: true };
      } catch (err: any) {
        console.error("Error updating API cart:", err);
        const errorMsg = err.response?.data?.error || "Failed to update quantity.";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    }

    // Guest Mode
    try {
      const guestCart = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || "[]");
      const itemIndex = guestCart.findIndex((item: CartItem) => item.id === cartItemId);
      
      if (itemIndex > -1) {
        guestCart[itemIndex].quantity = newQuantity;
        guestCart[itemIndex].updated_at = new Date().toISOString();
        localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(guestCart));
        setCart(guestCart);
        return { success: true };
      }
      return { success: false, error: "Item not found" };
    } catch (err) {
      setError("Failed to update guest cart");
      return { success: false, error: "Failed to update quantity" };
    }
  };

  const getCartTotal = () =>
    cart.reduce((total, item) => {
      const price = typeof item.price === 'string' 
        ? parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0
        : parseFloat(item.price) || 0;
      return total + price * item.quantity;
    }, 0);

  const getCartItemsCount = () => cart.reduce((total, item) => total + item.quantity, 0);

  const clearCart = () => setCart([]);

  const clearError = () => setError(null);

  const contextValue: CartContextType = {
    userId: user?.id ?? 0,
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartItemsCount,
    clearCart,
    loading,
    error,
    clearError,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};