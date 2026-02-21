import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, X, Plus, Minus, Star, Check, ShoppingCart, Heart } from 'lucide-react';
import { apiClient } from '@/context/axios';
import { useCart } from './CartContext';
import { useAuthStore } from '@/context/userContext';

interface Product {
  id: number;
  name: string;
  price: string;
  stock_quantity: number;
  image_url: string;
  categories: { id: number; name: string }; // Fixed: This should be an object, not array
  category_id: number;
  discount_percentage?: number;
  rating?: number;
  description?: string;
  views?: number;
  reviews?: Review[];
}

interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment: string;
  created_at: string;
  username: string;
}

interface Category {
  id: number;
  name: string;
}

interface PriceRange {
  min: number;
  max: number;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
  timestamp: string;
}

const Shop: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 5000 });
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'outStock'>('all');

  // Dialog and cart states
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastIdCounter, setToastIdCounter] = useState<number>(0);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  // Review dialog state
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState<boolean>(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  const { addToCart, error: cartError, clearError } = useCart();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Search states
  const [productSearch, setProductSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  const ITEMS_PER_PAGE = 9;

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dimpo-pbackend.onrender.com';
  const getImageUrl = (url: string) => url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const getProductCategoryName = (product: Product): string => {
    // The categories field is an object with id and name properties
    if (product.categories && product.categories.name) {
      return product.categories.name;
    }
    
    // Fallback to "Unknown Category" if no category is found
    return "Unknown Category";
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/products');
      const products = response.data;
      setAllProducts(products);
      
      const highestPrice = Math.max(...products.map((p: any) => parseFloat(p.price)), 1000);
      setPriceRange(prev => ({ ...prev, max: Math.ceil(highestPrice) }));

    } catch (err) {
      const e = err instanceof Error ? err : new Error('Unknown error');
      console.error(`Failed to load products: ${e.message}`);
      setError(e);
      showToast(`Failed to load products: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      console.log("Categories API Response:", response.data);
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      showToast('Failed to load categories', 'error');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  useEffect(() => {
    if (cartError) {
      showToast(cartError, 'error');
      setTimeout(() => {
        clearError();
      }, 100);
    }
  }, [cartError, clearError]);

  // Apply all filters
  const filteredProducts = allProducts.filter((item: Product) => {
    const matchesSearch = productSearch === '' || 
      item.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(productSearch.toLowerCase()));

    const matchesCategory = !selectedCategory || 
      (item.categories && item.categories.name === selectedCategory);
    
    const matchesBrand = !selectedBrand || item.name.toLowerCase().includes(selectedBrand.toLowerCase());

    const price = parseFloat(item.price);
    const matchesPrice = price >= priceRange.min && price <= priceRange.max;

    const matchesStock =
      stockFilter === 'all' ? true :
        stockFilter === 'inStock' ? item.stock_quantity > 0 :
          item.stock_quantity <= 0;

    return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesStock;
  });

  // Calculate pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Load more products - no longer used as we use pagination buttons

  // Load more products - no longer used as we use pagination buttons

  // Dialog functions
  const openDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
    setQuantity(1);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  const incrementQuantity = () => {
    if (selectedProduct && quantity < selectedProduct.stock_quantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // Toast functions
  const formatTimestamp = (): string => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const showToast = (message: string, type: "success" | "error" = "success"): void => {
    const id = toastIdCounter;
    setToastIdCounter((prev) => prev + 1);
    const timestamp = formatTimestamp();
    const newToast = { id, message, type, timestamp };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: number): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Cart functions
  const handleAddToWishlist = (product: Product, e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    const isInWishlist = wishlist.find((item) => item.id === product.id);
    if (isInWishlist) {
      const newWishlist = wishlist.filter(item => item.id !== product.id);
      setWishlist(newWishlist);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      showToast(`${product.name} removed from wishlist`, "success");
    } else {
      const newWishlist = [...wishlist, product];
      setWishlist(newWishlist);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      showToast(`${product.name} successfully added to your wishlist`, "success");
    }
  };

  const handleAddToCart = async (product: Product, e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock_quantity <= 0) {
      showToast("This product is currently out of stock.", "error");
      return;
    }

    setAddingToCart(product.id);

    try {
      const result = await addToCart(product.id, 1);
      if (result?.success) {
        showToast(`${product.name} successfully added to cart`, "success");
        await fetchProducts(); // Refresh products to update stock
      } else {
        showToast(result?.error || 'Failed to add item to cart', 'error');
      }
    } catch (err) {
      console.error('handleAddToCart error:', err);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleAddToCartFromDialog = async (): Promise<void> => {
    if (!selectedProduct) return;

    if (selectedProduct.stock_quantity <= 0) {
      showToast("This product is currently out of stock.", "error");
      return;
    }

    setAddingToCart(selectedProduct.id);

    try {
      const result = await addToCart(selectedProduct.id, quantity);
      if (result?.success) {
        showToast(`${selectedProduct.name} successfully added to cart`, "success");
        await fetchProducts(); // Refresh products to update stock
        closeDialog();
      } else {
        showToast(result?.error || 'Failed to add item to cart', 'error');
      }
    } catch (err) {
      console.error('handleAddToCartFromDialog error:', err);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setAddingToCart(null);
    }
  };

  const goToCart = (): void => {
    navigate("/cart");
  };

  // Star rating renderer - same as NewProducts
  const renderStars = (rating = 4.5, productId?: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${productId}-${i}`} size={16} className="fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalf) {
      stars.push(
        <div key={`half-${productId}`} className="relative">
          <Star size={16} className="text-gray-300" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
          </div>
        </div>,
      );
    }

    const remainingStars = 5 - fullStars - (hasHalf ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${productId}-${i}`} size={16} className="text-gray-300" />);
    }

    return stars;
  };

  // Calculate total price for dialog
  const calculateTotalPrice = (price: string, qty: number) => {
    const numPrice = parseFloat(price);
    return (numPrice * qty).toFixed(2);
  };

  // Review functions - same as NewProducts
  const handleSubmitReview = async () => {
    if (!selectedProduct || !newReview.comment.trim()) {
      showToast("Please add a comment for your review.", "error");
      return;
    }

    if (!user?.id) {
      showToast("You must be logged in to submit a review.", "error");
      return;
    }

    try {
      const reviewData = {
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        user_id: user.id,
        username: user.username || user.email?.split("@")[0] || `User ${user.id}`,
      };

      const response = await apiClient.post(`/api/products/${selectedProduct.id}/reviews`, reviewData);

      const newReviewWithUser = response.data;

      const updatedProduct = {
        ...selectedProduct,
        reviews: [newReviewWithUser, ...(selectedProduct.reviews || [])],
      };
      setSelectedProduct(updatedProduct);

      showToast("Thank you! Your review has been submitted.");
      closeReviewDialog();
      setNewReview({ rating: 5, comment: "" });

      await fetchProducts();
    } catch (err: any) {
      console.error("Error submitting review:", err);
      const errorMessage =
        err.response?.data?.message || err.response?.data || "Failed to submit review. Please try again.";
      showToast(errorMessage, "error");
    }
  };

  const openReviewDialog = () => {
    setIsReviewDialogOpen(true);
  };

  const closeReviewDialog = () => {
    setIsReviewDialogOpen(false);
    setNewReview({ rating: 5, comment: "" });
  };

  const getProductReviews = (product: Product): Review[] => {
    return product.reviews || [];
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-buttons border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-montserratBold animate-pulse">Loading amazing products...</p>
    </div>
  );
  
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center max-w-md">
        <X size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-montserratBold text-red-900 mb-2">Oops! Something went wrong</h3>
        <p className="text-red-600 mb-6">{error.message}</p>
        <button 
          onClick={() => fetchProducts()}
          className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className='flex flex-col lg:flex-row justify-between pt-[100px] px-4 lg:px-[100px] gap-8'>
      {/* Sidebar with all filters */}
      <div className="lg:w-1/4 space-y-8 bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 h-fit">
        {/* Global Product Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={productSearch}
            onChange={(e) => { setProductSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-buttons outline-none transition-all"
          />
          <Star className="absolute left-3 top-3.5 text-gray-400 rotate-45" size={18} />
        </div>

        {/* Categories Filter */}
        <div>
          <h3 className='text-lg font-montserratBold mb-4 text-gray-800 border-b border-gray-100 pb-2'>Categories</h3>
          <div className="mb-4 relative">
             <input 
               type="text" 
               placeholder="Search categories..." 
               value={categorySearch}
               onChange={(e) => setCategorySearch(e.target.value)}
               className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-buttons"
             />
          </div>
          <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            <li
              className={`cursor-pointer p-2 rounded-lg transition-all duration-200 ${
                selectedCategory === null
                  ? "bg-buttons text-white shadow-md font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-buttons"
              }`}
              onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
            >
              All Categories
            </li>
            {categories
              .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
              .map((category) => (
              <li
                key={category.id}
                className={`cursor-pointer p-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === category.name
                    ? "bg-buttons text-white shadow-md font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-buttons"
                }`}
                onClick={() => { setSelectedCategory(category.name); setCurrentPage(1); }}
              >
                <span>{category.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Range Filter */}
        <div>
          <h3 className='text-lg font-montserratBold mb-4 text-gray-800 border-b border-gray-100 pb-2'>Price Range</h3>
          <div className="space-y-6">
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                <span>Min</span>
                <span>${priceRange.min}</span>
              </div>
              <input
                type="range"
                min="0"
                max={priceRange.max}
                value={priceRange.min}
                onChange={(e) => { setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) })); setCurrentPage(1); }}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-buttons"
              />
            </div>
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                <span>Max</span>
                <span>${priceRange.max}</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(...allProducts.map(p => parseFloat(p.price)), 1000)}
                value={priceRange.max}
                onChange={(e) => { setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) })); setCurrentPage(1); }}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-buttons"
              />
            </div>
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <h3 className='text-lg font-montserratBold mb-4 text-gray-800 border-b border-gray-100 pb-2'>Brands</h3>
          <div className="mb-4 relative">
             <input 
               type="text" 
               placeholder="Search brands..." 
               value={brandSearch}
               onChange={(e) => setBrandSearch(e.target.value)}
               className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-buttons"
             />
          </div>
          <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            <li
              className={`cursor-pointer p-2 rounded-lg transition-all duration-200 ${
                selectedBrand === null
                  ? "bg-buttons text-white shadow-md font-semibold"
                  : "text-gray-600 hover:bg-gray-100 hover:text-buttons"
              }`}
              onClick={() => { setSelectedBrand(null); setCurrentPage(1); }}
            >
              All Brands
            </li>
            {[...new Set(allProducts.map(item => item.name.split(' ')[0]))]
              .filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()))
              .slice(0, 20)
              .map((brand, index) => (
              <li
                key={index}
                className={`cursor-pointer p-2 rounded-lg transition-all duration-200 ${
                  selectedBrand === brand
                    ? "bg-buttons text-white shadow-md font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-buttons"
                }`}
                onClick={() => { setSelectedBrand(brand); setCurrentPage(1); }}
              >
                <span>{brand}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stock Filter */}
        <div>
          <h3 className='text-lg font-montserratBold mb-4 text-gray-800 border-b border-gray-100 pb-2'>Availability</h3>
          <ul className="space-y-2">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'inStock', label: 'In Stock' },
              { id: 'outStock', label: 'Coming Soon' }
            ].map((option) => (
              <li
                key={option.id}
                className={`cursor-pointer p-2 rounded-lg transition-all duration-200 flex items-center justify-between ${
                  stockFilter === option.id
                    ? "bg-buttons/10 text-buttons font-bold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-buttons"
                }`}
                onClick={() => { setStockFilter(option.id as any); setCurrentPage(1); }}
              >
                <span>{option.label}</span>
                {stockFilter === option.id && <Check size={16} />}
              </li>
            ))}
          </ul>
        </div>

        <button 
          onClick={() => navigate('/register')}
          className="w-full mt-4 bg-gradient-to-r from-buttons to-purple-600 text-white p-4 rounded-xl font-montserratBold shadow-lg hover:shadow-buttons/40 transition-all flex items-center justify-center gap-2 group"
        >
          Become an Agent
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {/* Product Section */}
      <div className="lg:w-3/4">
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-xl lg:text-3xl font-montserratBold text-gray-800">
              {selectedCategory || 'Our Collection'}
            </h3>
            <p className="text-sm text-gray-400 mt-1">Showing {paginatedProducts.length} of {totalItems} products</p>
          </div>
          <div className="flex gap-2">
             <button 
               onClick={() => {
                 setProductSearch('');
                 setSelectedCategory(null);
                 setSelectedBrand(null);
                 setStockFilter('all');
               }}
               className="text-xs font-bold text-gray-400 hover:text-buttons underline"
             >
               Reset Filters
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedProducts.map((card) => {
            const isInWishlist = wishlist.some(item => item.id === card.id);
            const isAddingThis = addingToCart === card.id;
            const inStock = card.stock_quantity > 0;

            return (
              <div key={card.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col h-[480px]">
                <div className="relative h-[320px] overflow-hidden">
                  <img
                    loading='lazy'
                    src={getImageUrl(card.image_url)}
                    alt={card.name}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    onError={e => { (e.target as HTMLImageElement).src = '/api/products/placeholder.jpg'; }}
                  />
                  
                  {/* Glassmorphism overlays */}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                  
                  {/* Stock/Sale Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {card.discount_percentage && card.discount_percentage > 0 ? (
                      <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                        -{card.discount_percentage}% OFF
                      </div>
                    ) : null}
                    {!inStock ? (
                      <div className="bg-gray-800/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                        COMING SOON
                      </div>
                    ) : card.stock_quantity <= 5 ? (
                      <div className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                        ONLY {card.stock_quantity} LEFT
                      </div>
                    ) : null}
                  </div>

                  {/* Quick Action Sidebar (Glassmorphism) */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-3 opacity-0 translate-x-10 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 z-10">
                    <button
                      onClick={(e) => handleAddToWishlist(card, e)}
                      className={`p-3 rounded-2xl backdrop-blur-md border border-white/40 shadow-xl transition-all hover:scale-110 ${
                        isInWishlist ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-800 hover:text-buttons'
                      }`}
                    >
                      <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => openDialog(card)}
                      className="p-3 bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl transition-all hover:scale-110 text-gray-800 hover:text-buttons"
                    >
                      <Plus size={20} />
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(card, e)}
                      disabled={!inStock || isAddingThis}
                      className={`p-3 rounded-2xl backdrop-blur-md border border-white/40 shadow-xl transition-all hover:scale-110 ${
                        !inStock ? 'bg-gray-300/50 cursor-not-allowed text-gray-500' : 
                        isAddingThis ? 'bg-buttons text-white cursor-wait' : 
                        'bg-white/90 text-gray-800 hover:text-buttons'
                      }`}
                    >
                      {isAddingThis ? (
                        <div className="w-5 h-5 border-2 border-buttons border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <ShoppingCart size={20} />
                      )}
                    </button>
                   </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className='text-[10px] font-bold text-buttons uppercase tracking-widest bg-buttons/5 px-2 py-0.5 rounded'>
                      {getProductCategoryName(card)}
                    </span>
                    <div className="flex gap-0.5">
                      {renderStars(card.rating ?? 4.5, card.id)}
                    </div>
                  </div>
                  
                  <h4 className='text-lg font-montserratBold text-gray-800 line-clamp-1 group-hover:text-buttons transition-colors'>
                    {card.name}
                  </h4>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className='text-2xl font-montserratBold text-gray-900'>
                        ${parseFloat(card.price).toFixed(2)}
                      </p>
                      {card.discount_percentage && card.discount_percentage > 0 && (
                        <p className="text-xs text-gray-400 line-through">
                          ${(parseFloat(card.price) / (1 - card.discount_percentage/100)).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => openDialog(card)}
                      className="text-xs font-bold text-buttons border-b-2 border-transparent hover:border-buttons transition-all uppercase tracking-tighter"
                    >
                      Quick View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12 mb-20">
            <button 
              onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo(0, 0); }}
              disabled={currentPage === 1}
              className="p-3 rounded-xl border border-gray-200 hover:bg-buttons hover:border-buttons hover:text-white transition-all disabled:opacity-30"
            >
              <Minus size={20} />
            </button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 0); }}
                  className={`w-12 h-12 rounded-xl font-bold transition-all ${
                    currentPage === i + 1 
                      ? 'bg-buttons text-white shadow-lg shadow-buttons/30' 
                      : 'bg-white border border-gray-100 text-gray-400 hover:border-buttons hover:text-buttons'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo(0, 0); }}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl border border-gray-200 hover:bg-buttons hover:border-buttons hover:text-white transition-all disabled:opacity-30"
            >
              <Plus size={20} />
            </button>
          </div>
        )}

        {filteredProducts.length === 0 && !false && ( // 'loading' was removed, replaced with false
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <X size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-montserratBold text-gray-500">No products found</h3>
            <p className="text-gray-400">Try adjusting your filters or search terms</p>
            <button 
              onClick={() => {
                setProductSearch('');
                setSelectedCategory(null);
                setSelectedBrand(null);
                setStockFilter('all');
              }}
              className="mt-6 text-buttons font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Product Detail Dialog - Same as NewProducts */}
      {isDialogOpen && selectedProduct && (
        <div
          className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={closeDialog}
        >
          <div
            className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] overflow-y-auto mx-4 shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg lg:text-xl font-montserratBold text-gray-800">More about the product</h3>
                    <ChevronRight size={20} className="text-gray-600" />
                  </div>
                  <button onClick={closeDialog} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm lg:text-base font-montserrat text-gray-600">
                    {getProductCategoryName(selectedProduct)}
                  </p>
                  <h4 className="text-xl lg:text-2xl font-montserratBold text-gray-800">{selectedProduct.name}</h4>

                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(selectedProduct.rating ?? 0, selectedProduct.id)}
                      </div>
                      <span className="text-sm text-gray-600">({selectedProduct.rating?.toFixed(1) ?? "0.0"}/5)</span>
                    </div>

                    {/* Views */}
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span>•</span>
                      <span>{selectedProduct.views ?? 0} views</span>
                    </div>

                    {/* Reviews */}
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span>•</span>
                      <span>{selectedProduct.reviews?.length ?? 0} reviews</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-montserratBold text-gray-800">Description</h5>
                    <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                      {selectedProduct.description ||
                        "Experience cutting-edge technology with this premium smartphone. Featuring advanced camera capabilities, lightning-fast performance, and sleek design that fits perfectly in your hand."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-montserratBold text-gray-800">Stock</h5>
                    <p className={`text-sm ${selectedProduct.stock_quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                      {selectedProduct.stock_quantity > 0
                        ? `${selectedProduct.stock_quantity} items available`
                        : "Out of stock"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-4">
                      <span className="font-montserratBold text-gray-800">Quantity:</span>
                      <div className="flex items-center border rounded-lg border-gray-200">
                        <button onClick={decrementQuantity} className="p-3 hover:bg-gray-100 transition-colors">
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-2 border-x border-gray-200 min-w-[50px] text-center text-sm">
                          {quantity}
                        </span>
                        <button onClick={incrementQuantity} className="p-3 hover:bg-gray-100 transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl lg:text-2xl font-montserratBold text-blue-500">
                        ${calculateTotalPrice(selectedProduct.price, quantity)}
                      </span>
                      {quantity > 1 && (
                        <p className="text-sm text-gray-500">
                          ${Number.parseFloat(selectedProduct.price).toFixed(2)} each
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <button
                      onClick={handleAddToCartFromDialog}
                      disabled={selectedProduct.stock_quantity <= 0 || addingToCart === selectedProduct.id}
                      className={`flex-1 py-3 px-6 rounded-lg font-montserratBold transition-colors ${
                        selectedProduct.stock_quantity <= 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : addingToCart === selectedProduct.id
                            ? "bg-blue-400 text-white cursor-wait"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {addingToCart === selectedProduct.id ? "Adding..." : "Add to Cart"}
                    </button>
                    <button className="flex-1 bg-gray-800 text-white py-3 px-6 rounded-lg font-montserratBold hover:bg-gray-700 transition-colors">
                      Buy Now
                    </button>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-montserratBold text-gray-800">Customer Reviews</h5>
                      <button
                        onClick={openReviewDialog}
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-montserratBold rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Add a Review
                      </button>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {getProductReviews(selectedProduct).map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-montserratBold text-sm text-gray-800">{review.username}</span>
                              <div className="flex items-center gap-1">{renderStars(review.rating, review.id)}</div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                        </div>
                      ))}
                      {getProductReviews(selectedProduct).length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No reviews yet. Be the first to review this product!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 p-6 lg:p-8">
                <div className="w-full h-[300px] lg:h-[500px] rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(selectedProduct.image_url) || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder-image.jpg"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Dialog - Same as NewProducts */}
          {/* Review Dialog */}
      {isReviewDialogOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={closeReviewDialog}
        >
          <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-montserratBold text-gray-800">Add Your Review</h3>
              <button onClick={closeReviewDialog} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-montserratBold text-gray-800 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview((prev) => ({ ...prev, rating: star }))}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star
                        size={24}
                        className={star <= newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">({newReview.rating}/5)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-montserratBold text-gray-800 mb-2">Your Review</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with this product..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none h-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeReviewDialog}
                  className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-montserratBold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={!newReview.comment.trim()}
                  className={`flex-1 py-3 px-6 rounded-lg font-montserratBold transition-colors ${
                    !newReview.comment.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications with "Go to Cart" button */}
      <div className="fixed top-4 right-4 z-[1000] space-y-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-white border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px] pointer-events-auto transform transition-all duration-300 ease-out opacity-100 translate-x-0 toast ${
              toast.type === 'error' ? 'border-red-500 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                toast.type === "error" ? "bg-red-100" : "bg-green-100"
              }`}>
                {toast.type === "error" ? (
                  <X size={16} className="text-red-600" />
                ) : (
                  <Check size={16} className="text-green-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-montserratBold mb-1 ${
                  toast.type === 'error' ? 'text-red-900' : 'text-gray-900'
                }`}>{toast.message}</p>
                <p className="text-xs text-gray-500 font-montserrat">{toast.timestamp}</p>
                {toast.message.includes("added to cart") && (
                  <button
                    onClick={goToCart}
                    className="text-xs text-blue-600 hover:text-blue-800 font-montserratBold mt-1"
                  >
                    Go to Cart →
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>
        {`
          @keyframes slideInFromRight {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .toast {
            animation: slideInFromRight 0.3s ease-out;
          }
          .font-montserrat {
            font-family: 'Montserrat', sans-serif;
            font-weight: 400;
          }
          .font-montserratBold {
            font-family: 'Montserrat', sans-serif;
            font-weight: 700;
          }
        `}
      </style>
    </div>
  );
};

export default Shop;
