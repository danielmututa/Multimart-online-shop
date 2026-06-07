import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast, Toaster } from "sonner"
import { apiClient } from "@/context/axios" // Use the same apiClient as ProductShowcase

interface ProductTableProps {
  onProductAction?: () => void
}

interface Category {
  id: number
  name: string
}

const Products: React.FC<ProductTableProps> = ({ onProductAction }) => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    category_name: "",
    discount_percentage: "",
    whatsapp_number: "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [useNewCategory, setUseNewCategory] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    loading: boolean
    error: string | null
    success: boolean
  }>({
    loading: false,
    error: null,
    success: false,
  })
  const [categories, setCategories] = useState<Category[]>([])
  const fetchCategories = async () => {
    let loadingToastId: string | number | undefined

    try {
      console.log("🔄 Fetching categories using apiClient...")
      loadingToastId = toast.loading("Loading categories...")

      // Use the same apiClient as ProductShowcase
      const response = await apiClient({
        url: "/api/products",
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const products = response.data
      console.log("Raw products from apiClient:", products)

      if (!Array.isArray(products)) {
        console.log("Response is not an array:", products)
        throw new Error("API response is not an array of products")
      }

      // Extract unique categories from products
      const uniqueCategories: Category[] = []
      const seenIds = new Set<number>()

      for (const product of products) {
        console.log("Processing product for categories:", product)

        if (
          product.categories &&
          product.categories.id &&
          product.categories.name &&
          !seenIds.has(product.categories.id)
        ) {
          uniqueCategories.push({
            id: product.categories.id,
            name: product.categories.name,
          })
          seenIds.add(product.categories.id)
        }
      }

      console.log("Extracted categories:", uniqueCategories)
      setCategories(uniqueCategories)

      toast.dismiss(loadingToastId)
      if (uniqueCategories.length > 0) {
        toast.success(`✅ Loaded ${uniqueCategories.length} categories!`)
      } else {
        toast.warning("⚠️ No categories found. Create your first product to add categories.")
      }
    } catch (error: any) {
      console.error("❌ Error fetching categories:", error)

      if (loadingToastId !== undefined) {
        toast.dismiss(loadingToastId)
      }

      // If it's a 404 error, we treat it as "no categories yet" (no products exist)
      if (error.response && error.response.status === 404) {
        setCategories([])
        return
      }

      const errorMessage = error instanceof Error ? error.message : "Failed to load categories"

      setCategories([])
      setSubmitStatus({
        loading: false,
        error: errorMessage,
        success: false,
      })

      toast.error("❌ Failed to load categories!")
      toast.error(errorMessage)
    }
  }

  // Fetch product for editing using apiClient
  useEffect(() => {
    fetchCategories()

    if (id) {
      const fetchProduct = async () => {
        let loadingToastId: string | number | undefined

        try {
          loadingToastId = toast.loading("Loading product...")

          const response = await apiClient({
            url: `/api/products/${id}`,
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })

          const product = response.data
          console.log("Fetched product for editing:", product)

          setFormData({
            name: product.name,
            description: product.description || "",
            price: product.price,
            stock_quantity: product.stock_quantity.toString(),
            category_name: product.categories?.name || "",
            discount_percentage: product.discount_percentage.toString(),
            whatsapp_number: product.whatsapp_number || "",
          })

          toast.dismiss(loadingToastId)
          toast.success("✅ Product loaded for editing!")
        } catch (error: unknown) {
          console.error("Error fetching product:", error)

          if (loadingToastId !== undefined) {
            toast.dismiss(loadingToastId)
          }

          const errorMessage = error instanceof Error ? error.message : "Failed to load product"

          setSubmitStatus({
            loading: false,
            error: errorMessage,
            success: false,
          })

          toast.error("❌ Failed to load product!")
          toast.error(errorMessage)
        }
      }

      fetchProduct()
    }
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
  }

  const handleCategoryChange = (value: string) => {
    console.log("Selected category_name:", value)
    setFormData((prev) => ({
      ...prev,
      category_name: value,
    }))
  }

  const toggleCategoryInput = () => {
    setUseNewCategory((prev) => !prev)
    setFormData((prev) => ({
      ...prev,
      category_name: "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus({ loading: true, error: null, success: false })

    // Validation
    const missingFields: string[] = []
    if (!formData.name.trim()) missingFields.push("name")
    if (!formData.price) missingFields.push("price")
    if (!formData.stock_quantity) missingFields.push("stock")
    if (!formData.category_name.trim()) missingFields.push("category")

    if (missingFields.length > 0) {
      const errorMsg = `Please fill in: ${missingFields.join(", ")}`
      setSubmitStatus({
        loading: false,
        error: errorMsg,
        success: false,
      })
      toast.error("❌ Missing required fields!")
      toast.error(errorMsg)
      return
    }

    const price = Number.parseFloat(formData.price)
    const stock = Number.parseInt(formData.stock_quantity, 10)
    const discount = formData.discount_percentage ? Number.parseFloat(formData.discount_percentage) : 0

    if (isNaN(price) || price <= 0) {
      const errorMsg = "Price must be a positive number"
      setSubmitStatus({
        loading: false,
        error: errorMsg,
        success: false,
      })
      toast.error("❌ Invalid price!")
      toast.error(errorMsg)
      return
    }

    if (isNaN(stock) || stock < 0) {
      const errorMsg = "Stock quantity must be a non-negative integer"
      setSubmitStatus({
        loading: false,
        error: errorMsg,
        success: false,
      })
      toast.error("❌ Invalid stock quantity!")
      toast.error(errorMsg)
      return
    }

    if (discount < 0) {
      const errorMsg = "Discount percentage cannot be negative"
      setSubmitStatus({
        loading: false,
        error: errorMsg,
        success: false,
      })
      toast.error("❌ Invalid discount!")
      toast.error(errorMsg)
      return
    }

    let loadingToastId: string | number | undefined

    try {
      loadingToastId = toast.loading(id ? "Updating product..." : "Creating product...")

      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name.trim())
      formDataToSend.append("description", formData.description.trim() || "")
      formDataToSend.append("price", formData.price)
      formDataToSend.append("stock_quantity", formData.stock_quantity)
      formDataToSend.append("category_name", formData.category_name.trim())
      formDataToSend.append("discount_percentage", formData.discount_percentage || "0")
      formDataToSend.append("whatsapp_number", formData.whatsapp_number.trim() || "")

      if (imageFile) {
        formDataToSend.append("file", imageFile)
      }

      // Use apiClient for submission (same as ProductShowcase)
      const url = id ? `/api/products/${id}` : "/api/products/newproduct"
      const method = id ? "PUT" : "POST"

      console.log(`Submitting to: ${url} with method: ${method}`)

      const response = await apiClient({
        url,
        method,
        data: formDataToSend,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Submission successful:", response.data)

      toast.dismiss(loadingToastId)
      toast.success(`✅ Product ${id ? "updated" : "created"} successfully!`)

      setSubmitStatus({ loading: false, error: null, success: true })

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        category_name: "",
        discount_percentage: "",
        whatsapp_number: "",
      })
      setImageFile(null)
      setUseNewCategory(false)

      // Refresh categories
      await fetchCategories()
      if (onProductAction) onProductAction()

      setTimeout(() => {
        navigate("/")
      }, 1000)
    } catch (error: unknown) {
      console.error("Submission error:", error)

      if (loadingToastId !== undefined) {
        toast.dismiss(loadingToastId)
      }

      const errorMessage = error instanceof Error ? error.message : "An error occurred while submitting"

      setSubmitStatus({
        loading: false,
        error: errorMessage,
        success: false,
      })

      toast.error(`❌ Failed to ${id ? "update" : "create"} product!`)
      toast.error(errorMessage)
    }
  }

  return (
    <>
      <Toaster position="top-right" richColors closeButton />

      <div className="w-full py-5 lg:py-10">
        <h2 className="text-lg lg:text-2xl font-medium mb-4">{id ? "Edit Product" : "Create New Product/Category"}</h2>

        {/* DEBUG BUTTONS */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button type="button" onClick={debugAPI} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3">
            🔍 DEBUG API CONNECTION
          </Button>
          <Button
            type="button"
            onClick={fetchCategories}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3"
          >
            🔄 RETRY LOAD CATEGORIES
          </Button>
        </div> */}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="image" className="block text-sm font-medium">
              Product Image (Optional)
            </label>
            <Input id="image" name="file" type="file" accept="image/*" className="w-full" onChange={handleFileChange} />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Product Name *
            </label>
            <Input
              id="name"
              name="name"
              className="w-full"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Product Description (Optional)
            </label>
            <Input
              id="description"
              name="description"
              className="w-full"
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium">
              Product Price *
            </label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              className="w-full"
              placeholder="Enter product price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="stock_quantity" className="block text-sm font-medium">
              Product Stock *
            </label>
            <Input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min="0"
              className="w-full"
              placeholder="Enter product stock"
              value={formData.stock_quantity}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="category_name" className="block text-sm font-medium">
              Product Category *
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input type="checkbox" id="use_new_category" checked={useNewCategory} onChange={toggleCategoryInput} />
              <label htmlFor="use_new_category" className="text-sm">
                Create new category
              </label>
            </div>

            {useNewCategory ? (
              <Input
                id="category_name"
                name="category_name"
                className="w-full"
                placeholder="Enter new category name (e.g., Electronics, Books, Clothing)"
                value={formData.category_name}
                onChange={handleInputChange}
                required
              />
            ) : (
              <>
                {categories.length === 0 ? (
                  <div className="p-4 border border-yellow-300 bg-yellow-50 rounded">
                    <p className="text-yellow-800 text-sm mb-2">⚠️ No categories found.</p>
                    <p className="text-yellow-700 text-xs mb-2">This means:</p>
                    <ul className="text-yellow-700 text-xs list-disc list-inside space-y-1 mb-2">
                      <li>No products exist yet (so no categories)</li>
                      <li>Backend connection issue</li>
                    </ul>
                    <p className="text-yellow-800 text-sm">
                      👆 Click "DEBUG API CONNECTION" above or check "Create new category" to proceed.
                    </p>
                  </div>
                ) : (
                  <Select onValueChange={handleCategoryChange} value={formData.category_name || ""} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </>
            )}
          </div>

          <div>
            <label htmlFor="discount_percentage" className="block text-sm font-medium">
              Product Discount (%) (Optional)
            </label>
            <Input
              id="discount_percentage"
              name="discount_percentage"
              type="number"
              step="0.01"
              min="0"
              className="w-full"
              placeholder="Enter product discount"
              value={formData.discount_percentage}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="whatsapp_number" className="block text-sm font-medium">
              WhatsApp Number (Optional)
            </label>
            <Input
              id="whatsapp_number"
              name="whatsapp_number"
              type="text"
              className="w-full"
              placeholder="Enter WhatsApp number (e.g., +263...)"
              value={formData.whatsapp_number}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Button type="submit" disabled={submitStatus.loading} className="w-full">
              {submitStatus.loading ? "Submitting..." : id ? "Update Product" : "Create Product"}
            </Button>
          </div>

          {submitStatus.error && <p className="text-red-500 text-sm">{submitStatus.error}</p>}
          {submitStatus.success && (
            <p className="text-green-500 text-sm">{id ? "Product updated" : "Product created"} successfully!</p>
          )}
        </form>
      </div>
    </>
  )
}

export default Products
