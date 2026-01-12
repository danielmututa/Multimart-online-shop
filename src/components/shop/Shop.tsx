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
  // Backend data states
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dimpo-pbackend.onrender.com';
  const getImageUrl = (url: string) => url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const ITEMS_PER_PAGE = 9;

  // Fixed category display function - same as NewProducts
  const getProductCategoryName = (product: Product): string => {
    // The categories field is an object with id and name properties
    if (product.categories && product.categories.name) {
      return product.categories.name;
    }
    
    // Fallback to "Unknown Category" if no category is found
    return "Unknown Category";
  };

  // Fetch products from API
  const fetchProducts = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1 && !append) setLoading(true);
      if (page > 1) setLoadingMore(true);

      const response = await apiClient.get('/api/products');
      const products = response.data;
      
      console.log("Products API Response:", response.data);
      
      // Debug first product structure
      if (response.data && response.data.length > 0) {
        console.log("First product structure:", response.data[0]);
        console.log("First product categories:", response.data[0].categories);
      }
      
      if (page === 1 && !append) {
        setAllProducts(products);
        const initialProducts = products.slice(0, ITEMS_PER_PAGE);
        setDisplayedProducts(initialProducts);
        setHasMore(products.length > ITEMS_PER_PAGE);
        setCurrentPage(1);
      } else {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const newProducts = products.slice(startIndex, endIndex);
        
        if (newProducts.length > 0) {
          setDisplayedProducts(prev => [...prev, ...newProducts]);
          setCurrentPage(page);
        }
        
        setHasMore(endIndex < products.length);
      }
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Unknown error');
      setError(e);
      showToast(`Failed to load products: ${e.message}`, 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
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

  // Apply filters to displayed products - Fixed category filtering
  const filteredProducts = displayedProducts.filter((item: Product) => {
    const matchesCategory = !selectedCategory || 
      (item.categories && item.categories.name === selectedCategory);
    
    const matchesBrand = !selectedBrand || item.name.toLowerCase().includes(selectedBrand.toLowerCase());

    // Handle price filtering
    const price = parseFloat(item.price);
    const matchesPrice = price >= priceRange.min && price <= priceRange.max;

    const matchesStock =
      stockFilter === 'all' ? true :
        stockFilter === 'inStock' ? item.stock_quantity > 0 :
          item.stock_quantity <= 0;

    return matchesCategory && matchesBrand && matchesPrice && matchesStock;
  });

  // Get unique brands from all products
  const brands = [...new Set(allProducts.map(item => item.name))];

  // Load more products
  const loadMoreProducts = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(currentPage + 1, true);
    }
  };

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

  if (loading) return <div className="text-center py-10">Loading products...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error.message}</div>;

  return (
    <div className='flex flex-col lg:flex-row justify-between pt-[100px] px-4 lg:px-[100px] gap-8'>
      {/* Sidebar with all filters */}
      <div className="lg:w-1/4 space-y-8 bg-white p-6 lg:pl-0 lg:pb-0 lg:pt-0 pr-6 rounded-lg shadow-sm">
        {/* Categories Filter */}
        <div>
          <h3 className='text-lg font-bold mb-4 text-gray-800 border-b pb-2'>Categories</h3>
          <ul className="space-y-2">
            <li
              className={`cursor-pointer transition-colors duration-200 ${
                selectedCategory === null
                  ? "text-navbar font-semibold"
                  : "text-gray-600 hover:text-navbar"
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </li>
            {categories.map((category) => (
              <li
                key={category.id}
                className={`cursor-pointer transition-colors duration-200 flex items-center gap-2 ${
                  selectedCategory === category.name
                    ? "text-navbar font-semibold"
                    : "text-gray-600 hover:text-navbar"
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <span className={`w-4 h-4 border rounded-full flex items-center justify-center ${
                  selectedCategory === category.name
                    ? "border-navbar"
                    : "border-gray-300"
                }`}>
                  {selectedCategory === category.name && (
                    <span className="w-2 h-2 bg-navbar rounded-full" />
                  )}
                </span>
                <span>{category.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Range Filter */}
        <div>
          <h3 className='text-lg font-bold mb-4 text-gray-800 border-b pb-2'>Price Range</h3>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm text-gray-600">Minimum Price: ${priceRange.min}</label>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-navbar"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm text-gray-600">Maximum Price: ${priceRange.max}</label>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-navbar"
              />
            </div>
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <h3 className='text-lg font-bold mb-4 text-gray-800 border-b pb-2'>Brands</h3>
          <ul className="space-y-2">
            <li
              className={`cursor-pointer transition-colors duration-200 ${
                selectedBrand === null
                  ? "text-navbar font-semibold"
                  : "text-gray-600 hover:text-navbar"
              }`}
              onClick={() => setSelectedBrand(null)}
            >
              All Brands
            </li>
            {brands.slice(0, 10).map((brand, index) => (
              <li
                key={index}
                className={`cursor-pointer transition-colors duration-200 flex items-center gap-2 ${
                  selectedBrand === brand
                    ? "text-navbar font-semibold"
                    : "text-gray-600 hover:text-navbar"
                }`}
                onClick={() => setSelectedBrand(brand)}
              >
                <span className={`w-4 h-4 border rounded-full flex items-center justify-center ${
                  selectedBrand === brand
                    ? "border-navbar"
                    : "border-gray-300"
                }`}>
                  {selectedBrand === brand && (
                    <span className="w-2 h-2 bg-navbar rounded-full" />
                  )}
                </span>
                <span>{brand}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stock Filter */}
        <div>
          <h3 className='text-lg font-bold mb-4 text-gray-800 border-b pb-2'>Availability</h3>
          <ul className="space-y-2">
            <li
              className={`cursor-pointer transition-colors duration-200 ${
                stockFilter === 'all'
                  ? "text-navbar font-semibold"
                  : "text-gray-600 hover:text-navbar"
              }`}
              onClick={() => setStockFilter('all')}
            >
              All Items
            </li>
            <li
              className={`cursor-pointer transition-colors duration-200 flex items-center gap-2 ${
                stockFilter === 'inStock'
                  ? "text-navbar font-semibold"
                  : "text-gray-600 hover:text-navbar"
              }`}
              onClick={() => setStockFilter('inStock')}
            >
              <span className={`w-4 h-4 border rounded-full flex items-center justify-center ${
                stockFilter === 'inStock'
                  ? "border-navbar"
                  : "border-gray-300"
              }`}>
                {stockFilter === 'inStock' && (
                  <span className="w-2 h-2 bg-navbar rounded-full" />
                )}
              </span>
              In Stock
            </li>
            <li
              className={`cursor-pointer transition-colors duration-200 flex items-center gap-2 ${
                stockFilter === 'outStock'
                  ? "text-navbar font-semibold"
                  : "text-gray-600 hover:text-navbar"
              }`}
              onClick={() => setStockFilter('outStock')}
            >
              <span className={`w-4 h-4 border rounded-full flex items-center justify-center ${
                stockFilter === 'outStock'
                  ? "border-navbar"
                  : "border-gray-300"
              }`}>
                {stockFilter === 'outStock' && (
                  <span className="w-2 h-2 bg-navbar rounded-full" />
                )}
              </span>
              Out of Stock
            </li>
          </ul>
        </div>
      </div>

      {/* Product Section */}
      <div className="lg:w-3/4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl lg:text-2xl font-bold text-gray-800">
            Products ({filteredProducts.length})
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((card) => {
            const isInWishlist = wishlist.some(item => item.id === card.id);
            const isAddingThis = addingToCart === card.id;
            const inStock = card.stock_quantity > 0;

            return (
              <div key={card.id} className="group relative bg-white overflow-hidden">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    loading='lazy'
                    src={getImageUrl(card.image_url)}
                    alt={card.name}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                    }}
                  />

                  {/* Stock indicators */}
                  {inStock ? (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      {card.stock_quantity} in stock
                    </div>
                  ) : (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Out of Stock
                    </div>
                  )}

                  {/* Icons Container - Fixed for mobile */}
                  <div className="absolute top-0 right-4 h-full flex items-center gap-4 flex-col justify-center sm:opacity-0 sm:translate-y-5 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-300">
                    <button
                      onClick={(e) => handleAddToWishlist(card, e)}
                      className={`p-2 rounded-full shadow-md hover:scale-110 transition-transform ${
                        isInWishlist ? 'bg-red-500 text-white' : 'bg-white hover:text-buttons'
                      }`}
                    >
                      <Heart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => openDialog(card)}
                      className="p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform hover:text-buttons"
                    >
                      <Plus size={18} />
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(card, e)}
                      disabled={!inStock || isAddingThis}
                      className={`p-2 rounded-full shadow-md hover:scale-110 transition-transform ${
                        !inStock ? 'bg-gray-300 cursor-not-allowed' : 
                        isAddingThis ? 'bg-blue-500 text-white cursor-wait' : 
                        'bg-white hover:text-buttons'
                      }`}
                    >
                      {isAddingThis ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <ShoppingCart size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className='text-sm text-gray-500'>
                    {getProductCategoryName(card)}
                  </p>
                  <p className='text-lg font-semibold mt-1 group-hover:text-buttons transition-colors duration-300'>
                    {card.name}
                  </p>
                  <p className='text-lg font-bold text-gray-900 mt-2'>
                    ${parseFloat(card.price).toFixed(2)}
                    {card.discount_percentage && card.discount_percentage > 0 && (
                      <span className="text-red-500 ml-2 text-sm">-{card.discount_percentage}%</span>
                    )}
                  </p>
                  <p className={`text-sm mt-2 ${
                    inStock ? "text-green-600" : "text-red-500"
                  }`}>
                    {inStock ? `${card.stock_quantity} In Stock` : 'Out of Stock'}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {renderStars(card.rating ?? 4.5, card.id)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMoreProducts}
              disabled={loadingMore}
              className="bg-buttons text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                'Load More Products'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Product Detail Dialog - Same as NewProducts */}
      {isDialogOpen && selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDialog}
        >
          <div
            className="bg-white rounded-lg w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto mx-4"
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