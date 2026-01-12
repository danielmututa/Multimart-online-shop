import type React from "react"
import { useEffect } from "react"
import { useState } from "react"
import { useCart } from "../shop/CartContext"
import { useNavigate } from "react-router-dom"
// import { Star, Plus, ShoppingCart, Heart, X, Check, ChevronRight, Minus } from "lucide-react"
import { Star, Plus, ShoppingCart, Heart, X, Check, ChevronRight, Minus, User, Briefcase } from "lucide-react"
import { apiClient } from "@/context/axios"
import { useAuthStore } from "@/context/userContext"
import AgentApplicationDialog from '../shop/AgentApplicationDialog';
import MyAgentApplications from "../shop/MyAgentApplications";
// import { User, } from "lucide-react"

interface Product {
  id: number
  name: string
  price: string
  stock_quantity: number
  image_url: string
  categories: { id: number; name: string } // This is an object, not array
  category_id: number
  discount_percentage?: number
  rating?: number
  description?: string
  views?: number
  reviews?: Review[]
}

interface Review {
  id: number
  user_id: number
  product_id: number
  rating: number
  comment: string
  created_at: string
  username: string // Changed from user_name to match your data
}

interface Toast {
  id: number
  message: string
  type: string
  timestamp: string
}

const NewProducts = () => {
  const { addToCart, error: cartError, clearError } = useCart()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
 const [isMyApplicationsDialogOpen, setIsMyApplicationsDialogOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [toastIdCounter, setToastIdCounter] = useState(0)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState<number>(1)

  // Review dialog state
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState<boolean>(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })

  // const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://dimpo-pbackend.onrender.com"
  // const getImageUrl = (url: string) => (url.startsWith("http") ? url : `${BASE_URL}${url}`)

  const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) {
    console.warn('No image_url provided, using placeholder');
    return '/placeholder-image.jpg';
  }
  // Simply return the URL as-is - it's already a full Cloudinary URL
  return imageUrl;
};

  // Limit to 9 products
  const displayedProducts = products.slice(0, 9)

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get("/api/products")
      console.log("Products API Response:", response.data)
      
      // Debug first product structure
      if (response.data && response.data.length > 0) {
        console.log("First product structure:", response.data[0])
        console.log("First product categories:", response.data[0].categories)
      }
      
      setProducts(response.data)
      const savedWishlist = localStorage.getItem("wishlist")
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist))
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown error")
      setError(e)
      showToast(`Failed to load products: ${e.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  // Fixed category display function - directly access the categories object
  const getProductCategoryName = (product: Product): string => {
    // The categories field is an object with id and name properties
    if (product.categories && product.categories.name) {
      return product.categories.name
    }
    
    // Fallback to "Unknown Category" if no category is found
    return "Unknown Category"
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (cartError) {
      showToast(cartError, "error")
      setTimeout(() => {
        clearError()
      }, 100)
    }
  }, [cartError, clearError])

  const formatTimestamp = (): string => {
    const now = new Date()
    const day = now.getDate().toString().padStart(2, "0")
    const month = (now.getMonth() + 1).toString().padStart(2, "0")
    const year = now.getFullYear()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const seconds = now.getSeconds().toString().padStart(2, "0")
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  const showToast = (message: string, type = "success") => {
    const id = toastIdCounter
    setToastIdCounter((prev) => prev + 1)
    setToasts((prev) => [...prev, { id, message, type, timestamp: formatTimestamp() }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000)
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // Dialog functions
  const openDialog = (product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
    setQuantity(1)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setSelectedProduct(null)
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  const toggleWishlist = (product: Product, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const isInWishlist = wishlist.some((item) => item.id === product.id)
    const newWishlist = isInWishlist ? wishlist.filter((item) => item.id !== product.id) : [...wishlist, product]
    setWishlist(newWishlist)
    localStorage.setItem("wishlist", JSON.stringify(newWishlist))
    showToast(
      isInWishlist ? `${product.name} removed from wishlist` : `${product.name} successfully added to your wishlist`,
    )
  }

  const handleAddToCart = async (product: Product, e: React.MouseEvent<HTMLButtonElement>, qty = 1) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock_quantity <= 0) {
      showToast("This product is currently out of stock.", "error")
      return
    }

    setAddingToCart(product.id)

    try {
      const result = await addToCart(product.id, qty)

      if (result?.success) {
        showToast(`${product.name} successfully added to cart`)
        await fetchProducts()
      } else {
        showToast(result?.error || "Failed to add item to cart", "error")
      }
    } catch (err) {
      console.error("handleAddToCart error:", err)
      showToast("Something went wrong. Please try again.", "error")
    } finally {
      setAddingToCart(null)
    }
  }

  const handleAddToCartFromDialog = async () => {
    if (!selectedProduct) return

    if (selectedProduct.stock_quantity <= 0) {
      showToast("This product is currently out of stock.", "error")
    } else {
      setAddingToCart(selectedProduct.id)
      try {
        const result = await addToCart(selectedProduct.id, quantity)
        if (result?.success) {
          showToast(`${selectedProduct.name} successfully added to cart`)
          await fetchProducts()
          closeDialog()
        } else {
          showToast(result?.error || "Failed to add item to cart", "error")
        }
      } catch (err) {
        console.error("handleAddToCartFromDialog error:", err)
        showToast("Something went wrong. Please try again.", "error")
      } finally {
        setAddingToCart(null)
      }
    }
  }

  const goToCart = () => navigate("/cart")
  const goToShop = () => navigate("/shop")
  const goToMyAgentApplications = () => navigate("/my-agent-applications")

  const renderStars = (rating = 4.5, productId?: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${productId}-${i}`} size={16} className="fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalf) {
      stars.push(
        <div key={`half-${productId}`} className="relative">
          <Star size={16} className="text-gray-300" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
          </div>
        </div>,
      )
    }

    const remainingStars = 5 - fullStars - (hasHalf ? 1 : 0)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${productId}-${i}`} size={16} className="text-gray-300" />)
    }

    return stars
  }

  // Calculate total price for dialog
  const calculateTotalPrice = (price: string, qty: number) => {
    const numPrice = Number.parseFloat(price)
    return (numPrice * qty).toFixed(2)
  }

  const handleSubmitReview = async () => {
    if (!selectedProduct || !newReview.comment.trim()) {
      showToast("Please add a comment for your review.", "error")
      return
    }

    if (!user?.id) {
      showToast("You must be logged in to submit a review.", "error")
      return
    }

    try {
      const reviewData = {
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        user_id: user.id,
        username: user.username || user.email?.split("@")[0] || `User ${user.id}`,
      }

      const response = await apiClient.post(`/api/products/${selectedProduct.id}/reviews`, reviewData)

      const newReviewWithUser = response.data

      const updatedProduct = {
        ...selectedProduct,
        reviews: [newReviewWithUser, ...(selectedProduct.reviews || [])],
      }
      setSelectedProduct(updatedProduct)

      showToast("Thank you! Your review has been submitted.")
      closeReviewDialog()
      setNewReview({ rating: 5, comment: "" })

      await fetchProducts()
    } catch (err: any) {
      console.error("Error submitting review:", err)
      const errorMessage =
        err.response?.data?.message || err.response?.data || "Failed to submit review. Please try again."
      showToast(errorMessage, "error")
    }
  }

  const openReviewDialog = () => {
    setIsReviewDialogOpen(true)
  }

  const closeReviewDialog = () => {
    setIsReviewDialogOpen(false)
    setNewReview({ rating: 5, comment: "" })
  }

  const getProductReviews = (product: Product): Review[] => {
    return product.reviews || []
  }





  if (loading) return <div className="text-center py-10">Loading products...</div>
  if (error) return <div className="text-red-500 text-center py-10">{error.message}</div>

  return (
    <div className="px-[20px] py-[50px] flex flex-col items-center justify-center sm:px-[20px] sm:py-[50px] md:px-[40px] lg:px-[100px] lg:py-[80px]">
      <h2 className="pb-2 text-[20px] md:text-[23px] lg:text-[26px] font-montserratBold lg:pb-3">New Products</h2>
      <p className="pb-5 text-sm md:text-[16px] lg:text-[18px] text-gray-500 text-center lg:pb-8">
        Discover our newest smartphone collection featuring sleek designs, powerful cameras, and top models like iPhone,
        Samsung Galaxy, and Nokia. Enjoy cutting-edge performance and innovative features that fit your lifestyle. Stay
        connected and ahead of the curve — shop now!
      </p>

      <div className="flex justify-between w-full flex-wrap">
        {displayedProducts.map((product) => {
          const isInWishlist = wishlist.some((item) => item.id === product.id)
          const inStock = product.stock_quantity > 0
          const isAddingThis = addingToCart === product.id

          return (
            <div
              key={product.id}
              className=" mb-[40px] md:mb-[50px] lg:mb-[60px] w-full sm:w-[48%] lg:w-[30%] xl:w-[23%] relative h-[500px] lg:h-[450px]  group"
            >
              <div className="relative w-full h-[400px]  lg:h-[300px]   overflow-hidden">
                <img
                  loading="lazy"
                  src={getImageUrl(product.image_url) || "/placeholder.svg"}
                  alt={product.name}
                  className="hover:scale-105 transition-transform duration-500 w-full object-cover    h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder-image.jpg"
                  }}
                />

                {/* Stock indicators */}
                {inStock ? (
                  <div className="absolute top-2 left-2 bg-[#6600EE] text-white text-xs px-2 py-1 rounded">
                    {product.stock_quantity} in stock
                  </div>
                ) : (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Out of Stock
                  </div>
                )}
                {inStock && product.stock_quantity <= 5 && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    Only {product.stock_quantity} left!
                  </div>
                )}

                {/* Fixed mobile visibility - always visible on mobile, hover on desktop */}
                <div className="absolute top-0 right-4 h-full flex items-center gap-2 flex-col justify-center opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-5 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-300">
                  <button
                    onClick={(e) => toggleWishlist(product, e)}
                    className={`p-2 rounded-full shadow-md hover:scale-110 transition-transform ${
                      isInWishlist ? "bg-red-500 text-white" : "bg-white hover:text-buttons"
                    }`}
                  >
                    <Heart size={16} fill={isInWishlist ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => openDialog(product)}
                    className="p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform hover:text-buttons"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={!inStock || isAddingThis}
                    className={`p-2 rounded-full shadow-md hover:scale-110 transition-transform ${
                      !inStock
                        ? "bg-gray-300 cursor-not-allowed"
                        : isAddingThis
                          ? "bg-blue-500 text-white cursor-wait"
                          : "bg-white hover:text-buttons"
                    }`}
                    title={!inStock ? "Out of stock" : `Add to cart (${product.stock_quantity} available)`}
                  >
                    {isAddingThis ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ShoppingCart size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Display category name directly from the categories object */}
              <p className="text-sm lg:text-[15px] font-montserrat pt-[10px] text-gray-600">
                {getProductCategoryName(product)}
              </p>
              <p className="text-[16px] font-montserratBold pt-[14px] leading-[1.1] lg:text-[18px] group-hover:text-buttons transition-colors duration-500">
                {product.name}
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col">
                  <p className="text-sm font-montserrat text-gray-600 text-[16px]">
                    ${Number.parseFloat(product.price).toFixed(2)}
                    {product.discount_percentage && product.discount_percentage > 0 && (
                      <span className="text-[#6600EE] ml-2">-{product.discount_percentage}%</span>
                    )}
                  </p>
                  {/* <p className={`text-xs ${inStock ? "text-green-500" : "text-red-500"}`}>
                    {inStock ? "In Stock" : "Out of Stock"}
                  </p> */}
                </div>
                {/* <div className="flex items-center gap-1">{renderStars(product.rating ?? 4.5, product.id)}</div> */}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-center items-center">
        <button
          onClick={goToShop}
          className="p-2 w-[110px] relative lg:w-[180px] lg:p-3 border-2 border-buttons overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-0 h-full bg-buttons -skew-x-[45deg] transform transition-all duration-500 ease-out group-hover:w-[calc(100%)] group-hover:-left-[30px]"></div>
          <div className="absolute top-0 right-0 w-0 h-full bg-buttons -skew-x-[45deg] transform transition-all duration-500 ease-out group-hover:w-[calc(100%)] group-hover:-right-[30px]"></div>
          <span className="text-[12px] lg:text-[16px] relative z-10 font-montserratBold text-buttons transition-all duration-500 ease-out group-hover:text-[#6600EE] group-hover:scale-110">
            View More
          </span>
        </button>
      </div>

      {/* Product Detail Dialog - Enhanced with real reviews */}
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



                        {/* Become an Agent Section */}
{/* <div className="border-t pt-6 mt-6">
  <button
    onClick={() => {
      setIsAgentDialogOpen(true);
    }}
    className="w-full py-3 px-6 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
  >
    <User size={20} />
    Become an Agent for This Product
  </button>
  <p className="text-xs text-gray-500 text-center mt-2">
    Earn commission by promoting this product
  </p>
</div> */}



<div className="border-t pt-6 mt-6">
  <button
    onClick={() => {
      setIsAgentDialogOpen(true);
    }}
    className="w-full py-3 px-6 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
  >
    <User size={20} />
    Become an Agent for This Product
  </button>

  {/* View Applications Button */}
  <button
    onClick={() => {
      setIsMyApplicationsDialogOpen(true);
    }}
    className="w-full mt-3 py-3 px-6 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
  >
    <Briefcase size={20} />
    View My Agent Applications
  </button>
  
  <p className="text-xs text-gray-500 text-center mt-2">
    Earn commission by promoting this product
  </p>
</div>


{/* My Applications Dialog */}
{isMyApplicationsDialogOpen && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4"
    onClick={() => setIsMyApplicationsDialogOpen(false)}
  >
    <div
      className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">My Agent Applications</h2>
        <button
          onClick={() => setIsMyApplicationsDialogOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <MyAgentApplications />
    </div>
  </div>
)} 


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
                  {/* hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh */}
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


    {/* Agent Application Dialog */}
<AgentApplicationDialog
  isOpen={isAgentDialogOpen}
  onClose={() => setIsAgentDialogOpen(false)}
  productId={selectedProduct?.id || 0}
  productName={selectedProduct?.name || ''}
  onSuccess={() => {
    showToast('Agent application submitted successfully!', 'success');
    // Optionally refresh data here
  }}
/>


    {/* Toast Notifications */}
    <div className="fixed top-4 right-4 z-[1000] space-y-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-white border rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px] pointer-events-auto transform transition-all duration-300 ease-out opacity-100 translate-x-0 toast ${
            toast.type === "error" ? "border-red-500 bg-red-50" : "border-gray-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                toast.type === "error" ? "bg-red-100" : "bg-green-100"
              }`}
            >
              {toast.type === "error" ? (
                <X size={16} className="text-red-600" />
              ) : (
                <Check size={16} className="text-green-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-montserratBold mb-1 ${
                  toast.type === "error" ? "text-red-900" : "text-gray-900"
                }`}
              >
                {toast.message}
              </p>
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
)
}

export default NewProducts