// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { apiClient } from '@/context/axios';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { toast } from 'sonner';

// // Define Product interface
// interface Product {
//   id: number;
//   name: string;
//   price: string;
//   stock_quantity: number;
//   image_url: string;
//   categories: { id: number; name: string } | null;
//   discount_percentage: number;
//   cart: { id: number; product_id: number; quantity: number }[];
// }

// // Define FetchResult interface
// interface FetchResult<T> {
//   data: T | null;
//   loading: boolean;
//   error: Error | null;
// }

// // Custom useFetch hook
// function useFetch<T>(
//   url: string,
//   options: { method?: string; headers?: Record<string, string> } = {}
// ): FetchResult<T> {
//   const [data, setData] = useState<T | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await apiClient({
//           url,
//           method: options.method || 'GET',
//           headers: options.headers || { 'Content-Type': 'application/json' },
//         });
//         setData(response.data);
//       } catch (err: unknown) {
//         const error = err instanceof Error ? err : new Error('Unknown error');
//         setError(error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [url, options.method, options.headers]);

//   return { data, loading, error };
// }

// const ProductShowcase: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: number | null }>({
//     open: false,
//     productId: null,
//   });
//   const [editDialog, setEditDialog] = useState<{
//     open: boolean;
//     product: Product | null;
//   }>({
//     open: false,
//     product: null,
//   });
//   const [imageFile, setImageFile] = useState<File | null>(null);

//   // Base URL for backend
//   // const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
//   // const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dimpo-pbackend.onrender.com';
 

//   // Normalize image URL
//   // const getImageUrl = (imageUrl: string) => {
//   //   if (!imageUrl) {
//   //     console.warn('No image_url provided, using placeholder');
//   //     return '/placeholder-image.jpg';
//   //   }
//   //   if (imageUrl.startsWith('http')) return imageUrl;
//   //   return `${BASE_URL}${imageUrl}`;
//   // };

// const getImageUrl = (imageUrl: string) => {
//   if (!imageUrl) {
//     console.warn('No image_url provided, using placeholder');
//     return '/placeholder-image.jpg';
//   }
//   // Simply return the URL as-is - it's already a full Cloudinary URL
//   return imageUrl;
// };


//   // Fetch all products using useFetch
//   const { data, loading, error } = useFetch<Product[]>('/api/products', {
//     method: 'GET',
//     headers: { 'Content-Type': 'application/json' },
//   });

//   useEffect(() => {
//     if (data) {
//       console.log('Fetched products:', data);
//       data.forEach((product: Product) => {
//         const fullUrl = getImageUrl(product.image_url);
//         console.log(`Product: ${product.name}, Raw image_url: ${product.image_url}, Full URL: ${fullUrl}`);
//       });
//       setProducts(data);
//     }
//   }, [data]);

//   useEffect(() => {
//     if (error) {
//       console.error('Error fetching products:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//       toast.error(`Failed to load products: ${errorMessage}`);
//     }
//   }, [error]);

//   // Handle file input change with validation
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     if (file) {
//       // Validate file type and size (max 5MB, images only)
//       const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
//       const maxSize = 5 * 1024 * 1024; // 5MB
//       if (!validTypes.includes(file.type)) {
//         toast.error('Please upload a valid image (JPEG, PNG, or GIF).');
//         setImageFile(null);
//         return;
//       }
//       if (file.size > maxSize) {
//         toast.error('Image size must be less than 5MB.');
//         setImageFile(null);
//         return;
//       }
//     }
//     setImageFile(file);
//   };

//   // Handle product deletion
//   const handleDelete = async (productId: number) => {
//     try {
//       const deleteUrl = `/api/products/${productId}`;
//       console.log(`Sending DELETE request to: ${deleteUrl}`);
//       await apiClient.delete(deleteUrl);

//       setProducts(products.filter((product) => product.id !== productId));
//       setDeleteDialog({ open: false, productId: null });
//       toast.success('Product deleted successfully.');
//     } catch (err: unknown) {
//       console.error('Error deleting product:', err);
//       const errorMessage = err instanceof Error ? err.message : 'Unknown error';
//       toast.error(`Failed to delete product: ${errorMessage}`);
//     }
//   };



// // const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
// //   e.preventDefault();
// //   if (!editDialog.product) return;

// //   try {
// //     const formData = new FormData(e.currentTarget);
// //     const name = formData.get('name') as string;
// //     const priceStr = formData.get('price') as string;
// //     const stockStr = formData.get('stock_quantity') as string;
// //     const discountStr = formData.get('discount_percentage') as string;

// //     // Validation
// //     const missingFields: string[] = [];
// //     if (!name.trim()) missingFields.push('name');
// //     if (!priceStr) missingFields.push('price');
// //     if (!stockStr) missingFields.push('stock quantity');
// //     if (missingFields.length > 0) {
// //       throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
// //     }

// //     const price = parseFloat(priceStr);
// //     const stock_quantity = parseInt(stockStr, 10);
// //     const discount_percentage = discountStr ? parseInt(discountStr, 10) : 0;

// //     if (isNaN(price) || price <= 0) {
// //       throw new Error('Price must be a positive number');
// //     }
// //     if (isNaN(stock_quantity) || stock_quantity < 0) {
// //       throw new Error('Stock quantity must be a non-negative integer');
// //     }
// //     if (discount_percentage < 0) {
// //       throw new Error('Discount percentage cannot be negative');
// //     }

// //     // Prepare payload
// //     const payload = {
// //       name,
// //       price: priceStr,
// //       stock_quantity,
// //       discount_percentage,
// //       description: '',
// //       category_id: editDialog.product.categories?.id || null,
// //     };

// //     let response;
// //     const updateUrl = `/api/products/${editDialog.product.id}`;

// //     if (imageFile) {
// //       // Send FormData for image upload
// //       const formDataToSend = new FormData();
// //       formDataToSend.append('name', name);
// //       formDataToSend.append('price', priceStr);
// //       formDataToSend.append('stock_quantity', stockStr);
// //       formDataToSend.append('discount_percentage', discountStr || '0');
// //       formDataToSend.append('description', '');
// //       if (editDialog.product.categories?.id) {
// //         formDataToSend.append('category_id', editDialog.product.categories.id.toString());
// //       }
// //       formDataToSend.append('image', imageFile);

// //       console.log('Sending FormData to:', updateUrl);
// //       console.log('FormData fields:', {
// //         name,
// //         price: priceStr,
// //         stock_quantity: stockStr,
// //         discount_percentage: discountStr || '0',
// //         description: '',
// //         category_id: editDialog.product.categories?.id || 'none',
// //         image: imageFile.name,
// //       });

// //       response = await apiClient.put(updateUrl, formDataToSend, {
// //         headers: { 'Content-Type': 'multipart/form-data' },
// //       });
// //     } else {
// //       // Send JSON payload
// //       console.log('Sending JSON to:', updateUrl);
// //       console.log('JSON payload:', payload);

// //       response = await apiClient.put(updateUrl, payload, {
// //         headers: { 'Content-Type': 'application/json' },
// //       });
// //     }

// //     // Validate response
// //     if (!response.data || !response.data.id) {
// //       throw new Error('Invalid response from server: missing product data');
// //     }

// //     // Ensure the response matches the Product interface
// //     const updatedProductData: Product = {
// //       ...editDialog.product,
// //       ...response.data,
// //       price: response.data.price.toString(), // Ensure price is a string
// //       categories: response.data.categories || editDialog.product.categories,
// //       cart: response.data.cart || editDialog.product.cart,
// //     };

// //     // Update products state
// //     setProducts(
// //       products.map((product) =>
// //         product.id === updatedProductData.id ? updatedProductData : product
// //       )
// //     );

// //     setEditDialog({ open: false, product: null });
// //     setImageFile(null);
// //     toast.success('Product updated successfully.');
// //   } catch (err: unknown) {
// //     console.error('Error updating product:', err);
// //     const errorMessage = err instanceof Error ? err.message : 'Unknown error';
// //     toast.error(`Failed to update product: ${errorMessage}`);
// //   }
// // };



// const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
//   e.preventDefault();
//   if (!editDialog.product) return;

//   try {
//     const formData = new FormData(e.currentTarget);
//     const name = formData.get('name') as string;
//     const priceStr = formData.get('price') as string;
//     const stockStr = formData.get('stock_quantity') as string;
//     const discountStr = formData.get('discount_percentage') as string;

//     // Validation
//     const missingFields: string[] = [];
//     if (!name.trim()) missingFields.push('name');
//     if (!priceStr) missingFields.push('price');
//     if (!stockStr) missingFields.push('stock quantity');
//     if (missingFields.length > 0) {
//       throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
//     }

//     const price = parseFloat(priceStr);
//     const stock_quantity = parseInt(stockStr, 10);
//     const discount_percentage = discountStr ? parseInt(discountStr, 10) : 0;

//     if (isNaN(price) || price <= 0) {
//       throw new Error('Price must be a positive number');
//     }
//     if (isNaN(stock_quantity) || stock_quantity < 0) {
//       throw new Error('Stock quantity must be a non-negative integer');
//     }
//     if (discount_percentage < 0) {
//       throw new Error('Discount percentage cannot be negative');
//     }

//     const updateUrl = `/api/products/${editDialog.product.id}`;

//     // ALWAYS send FormData (backend expects multipart/form-data)
//     const formDataToSend = new FormData();
//     formDataToSend.append('name', name);
//     formDataToSend.append('price', priceStr);
//     formDataToSend.append('stock_quantity', stockStr);
//     formDataToSend.append('discount_percentage', discountStr || '0');
//     formDataToSend.append('description', '');
//     if (editDialog.product.categories?.id) {
//       formDataToSend.append('category_id', editDialog.product.categories.id.toString());
//     }
    
//     // Only append image if a new one is selected
//     if (imageFile) {
//       formDataToSend.append('image', imageFile);
//       console.log('Updating with new image:', imageFile.name);
//     } else {
//       console.log('Updating without new image');
//     }

//     console.log('Sending FormData to:', updateUrl);

//     const response = await apiClient.put(updateUrl, formDataToSend, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });




//   return (
//     <div className="w-full py-5  lg:py-10">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className=" text-lg lg:text-2xl  font-semibold">Product Showcase</h2>
//         <Link to="/products">
//           <Button 
//           className="text-[12px] md:text-sm"
//           variant="outline">
//           Create Product</Button>
//         </Link>
//       </div>

//       {error && (
//         <p className="text-red-500 mb-4">
//           {(error instanceof Error ? error.message : 'Failed to load products.')}
//         </p>
//       )}
//       {loading ? (
//         <p>Loading products...</p>
//       ) : products.length === 0 ? (
//         <p>No products available.</p>
//       ) : (
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Image</TableHead>
//               <TableHead>Title</TableHead>
//               <TableHead>Price</TableHead>
//               <TableHead>Category</TableHead>
//               <TableHead>Stock Quantity</TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {products.map((product) => (
//               <TableRow key={product.id}>
//                 <TableCell>
//                   <img
//                     src={getImageUrl(product.image_url)}
//                     alt={product.name}
//                     className="w-16 h-16 object-cover rounded"
//                     onError={(e) => {
//                       console.error(`Failed to load image: ${product.image_url}, Full URL: ${getImageUrl(product.image_url)}`);
//                       e.currentTarget.src = '/placeholder-image.jpg';
//                     }}
//                   />
//                 </TableCell>
//                 <TableCell>{product.name}</TableCell>
//                 <TableCell>
//                   ${parseFloat(product.price).toFixed(2)}
//                   {product.discount_percentage > 0 &&
//                     ` (-${product.discount_percentage}%)`}
//                 </TableCell>
//                 <TableCell>
//                   {product.categories ? product.categories.name : 'No Category'}
//                 </TableCell>
//                 <TableCell>{product.stock_quantity}</TableCell>
//                 <TableCell>
//                   <div className="flex space-x-2">
//                     {/* Edit Dialog */}
//                     <Dialog
//                       open={editDialog.open && editDialog.product?.id === product.id}
//                       onOpenChange={(open) =>
//                         setEditDialog({ open, product: open ? product : null })
//                       }
//                     >
//                       <DialogTrigger asChild>
//                         <Button 
//                         className="text-[12px] md:text-sm"
//                         variant="outline">Edit</Button>
//                       </DialogTrigger>
//                       <DialogContent>
//                         <DialogHeader>
//                           <DialogTitle>Edit Product</DialogTitle>
//                           <DialogDescription>
//                             Update the details for "{product.name}".
//                           </DialogDescription>
//                         </DialogHeader>
//                         <form onSubmit={handleUpdate} encType="multipart/form-data">
//                           <div className="grid gap-4 py-4">
//                             <div className="grid grid-cols-4 items-center gap-4">
//                               <label
//                                 htmlFor="name"
//                                 className="text-sm font-medium text-right"
//                               >
//                                 Name
//                               </label>
//                               <Input
//                                 id="name"
//                                 name="name"
//                                 defaultValue={product.name}
//                                 className="col-span-3"
//                                 required
//                               />
//                             </div>
//                             <div className="grid grid-cols-4 items-center gap-4">
//                               <label
//                                 htmlFor="price"
//                                 className="text-sm font-medium text-right"
//                               >
//                                 Price
//                               </label>
//                               <Input
//                                 id="price"
//                                 name="price"
//                                 type="number"
//                                 step="0.01"
//                                 defaultValue={parseFloat(product.price)}
//                                 className="col-span-3"
//                                 required
//                               />
//                             </div>
//                             <div className="grid grid-cols-4 items-center gap-4">
//                               <label
//                                 htmlFor="stock_quantity"
//                                 className="text-sm font-medium text-right"
//                               >
//                                 Stock Quantity
//                               </label>
//                               <Input
//                                 id="stock_quantity"
//                                 name="stock_quantity"
//                                 type="number"
//                                 defaultValue={product.stock_quantity}
//                                 className="col-span-3"
//                                 required
//                               />
//                             </div>

//                             <div className="grid grid-cols-4 items-center gap-4">
//                               <label
//                                 htmlFor="image"
//                                 className="text-sm font-medium text-right"
//                               >
//                                 Image
//                               </label>
//                               <Input
//                                 id="image"
//                                 name="file"
//                                 type="file"
//                                 accept="image/*"
//                                 className="col-span-3"
//                                 onChange={handleFileChange}
//                               />
//                             </div>

                            
//                             <div className="grid grid-cols-4 items-center gap-4">
//                               <label
//                                 htmlFor="discount_percentage"
//                                 className="text-sm font-medium text-right"
//                               >
//                                 Discount (%)
//                               </label>
//                               <Input
//                                 id="discount_percentage"
//                                 name="discount_percentage"
//                                 type="number"
//                                 defaultValue={product.discount_percentage}
//                                 className="col-span-3"
//                               />
//                             </div>
//                           </div>
//                           <DialogFooter>
//                             <Button
//                               type="button"
//                               variant="outline"
//                               className="text-[12px] md:text-sm"
//                               onClick={() => {
//                                 setEditDialog({ open: false, product: null });
//                                 setImageFile(null);
//                               }}
//                             >
//                               Cancel
//                             </Button>
//                             <Button
//                             className="text-[12px] md:text-sm"
//                              type="submit">Save</Button>
//                           </DialogFooter>
//                         </form>
//                       </DialogContent>
//                     </Dialog>

//                     {/* Delete Dialog */}
//                     <Dialog
//                       open={deleteDialog.open && deleteDialog.productId === product.id}
//                       onOpenChange={(open) =>
//                         setDeleteDialog({ open, productId: open ? product.id : null })
//                       }
//                     >
//                       <DialogTrigger asChild>
//                         <Button
//                         className="text-[12px] md:text-sm"
//                          variant="destructive">
//                           Delete
//                           </Button>
//                       </DialogTrigger>
//                       <DialogContent>
//                         <DialogHeader>
//                           <DialogTitle>Delete Product</ DialogTitle>
//                           <DialogDescription>
//                             Are you sure you want to delete "{product.name}"? This action cannot be undone.
//                           </DialogDescription>
//                         </DialogHeader>
//                         <DialogFooter>
//                           <Button
//                             variant="outline"
//                             className="text-[12px] md:text-sm"
//                             onClick={() => setDeleteDialog({ open: false, productId: null })}
//                           >
//                             Cancel
//                           </Button>
//                           <Button
//                           className="text-[12px] md:text-sm"
//                             variant="destructive"
//                             onClick={() => handleDelete(product.id)}
//                           >
//                             Delete
//                           </Button>
//                         </DialogFooter>
//                       </DialogContent>
//                     </Dialog>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       )}
//     </div>
//   );
// };

// export default ProductShowcase;








// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { apiClient } from '@/context/axios';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { toast } from 'sonner';

// // Define Product interface
// interface Product {
//   id: number;
//   name: string;
//   price: string;
//   stock_quantity: number;
//   image_url: string;
//   categories: { id: number; name: string } | null;
//   discount_percentage: number;
//   cart: { id: number; product_id: number; quantity: number }[];
// }

// // Define FetchResult interface
// interface FetchResult<T> {
//   data: T | null;
//   loading: boolean;
//   error: Error | null;
// }

// // Custom useFetch hook
// function useFetch<T>(
//   url: string,
//   options: { method?: string; headers?: Record<string, string> } = {}
// ): FetchResult<T> {
//   const [data, setData] = useState<T | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await apiClient({
//           url,
//           method: options.method || 'GET',
//           headers: options.headers || { 'Content-Type': 'application/json' },
//         });
//         setData(response.data);
//       } catch (err: unknown) {
//         const error = err instanceof Error ? err : new Error('Unknown error');
//         setError(error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [url, options.method, options.headers]);

//   return { data, loading, error };
// }

// const ProductShowcase: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: number | null }>({
//     open: false,
//     productId: null,
//   });
//   const [editDialog, setEditDialog] = useState<{
//     open: boolean;
//     product: Product | null;
//   }>({
//     open: false,
//     product: null,
//   });
//   const [imageFile, setImageFile] = useState<File | null>(null);

//   const getImageUrl = (imageUrl: string) => {
//     if (!imageUrl) {
//       console.warn('No image_url provided, using placeholder');
//       return '/placeholder-image.jpg';
//     }
//     return imageUrl;
//   };

//   // Fetch all products using useFetch
//   const { data, loading, error } = useFetch<Product[]>('/api/products', {
//     method: 'GET',
//     headers: { 'Content-Type': 'application/json' },
//   });

//   useEffect(() => {
//     if (data) {
//       console.log('Fetched products:', data);
//       data.forEach((product: Product) => {
//         const fullUrl = getImageUrl(product.image_url);
//         console.log(`Product: ${product.name}, Raw image_url: ${product.image_url}, Full URL: ${fullUrl}`);
//       });
//       setProducts(data);
//     }
//   }, [data]);

//   useEffect(() => {
//     if (error) {
//       console.error('Error fetching products:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//       toast.error(`Failed to load products: ${errorMessage}`);
//     }
//   }, [error]);

//   // Handle file input change with validation
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     if (file) {
//       const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
//       const maxSize = 5 * 1024 * 1024; // 5MB
//       if (!validTypes.includes(file.type)) {
//         toast.error('Please upload a valid image (JPEG, PNG, or GIF).');
//         setImageFile(null);
//         return;
//       }
//       if (file.size > maxSize) {
//         toast.error('Image size must be less than 5MB.');
//         setImageFile(null);
//         return;
//       }
//     }
//     setImageFile(file);
//   };

//   // Handle product deletion
//   const handleDelete = async (productId: number) => {
//     try {
//       const deleteUrl = `/api/products/${productId}`;
//       console.log(`Sending DELETE request to: ${deleteUrl}`);
//       await apiClient.delete(deleteUrl);

//       setProducts(products.filter((product) => product.id !== productId));
//       setDeleteDialog({ open: false, productId: null });
//       toast.success('Product deleted successfully.');
//     } catch (err: unknown) {
//       console.error('Error deleting product:', err);
//       const errorMessage = err instanceof Error ? err.message : 'Unknown error';
//       toast.error(`Failed to delete product: ${errorMessage}`);
//     }
//   };

//   const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (!editDialog.product) return;

//     try {
//       const formData = new FormData(e.currentTarget);
//       const name = formData.get('name') as string;
//       const priceStr = formData.get('price') as string;
//       const stockStr = formData.get('stock_quantity') as string;
//       const discountStr = formData.get('discount_percentage') as string;

//       // Validation
//       const missingFields: string[] = [];
//       if (!name.trim()) missingFields.push('name');
//       if (!priceStr) missingFields.push('price');
//       if (!stockStr) missingFields.push('stock quantity');
//       if (missingFields.length > 0) {
//         throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
//       }

//       const price = parseFloat(priceStr);
//       const stock_quantity = parseInt(stockStr, 10);
//       const discount_percentage = discountStr ? parseInt(discountStr, 10) : 0;

//       if (isNaN(price) || price <= 0) {
//         throw new Error('Price must be a positive number');
//       }
//       if (isNaN(stock_quantity) || stock_quantity < 0) {
//         throw new Error('Stock quantity must be a non-negative integer');
//       }
//       if (discount_percentage < 0) {
//         throw new Error('Discount percentage cannot be negative');
//       }

//       const updateUrl = `/api/products/${editDialog.product.id}`;

//       // ALWAYS send FormData (backend expects multipart/form-data)
//       const formDataToSend = new FormData();
//       formDataToSend.append('name', name);
//       formDataToSend.append('price', priceStr);
//       formDataToSend.append('stock_quantity', stockStr);
//       formDataToSend.append('discount_percentage', discountStr || '0');
//       formDataToSend.append('description', '');
//       if (editDialog.product.categories?.id) {
//         formDataToSend.append('category_id', editDialog.product.categories.id.toString());
//       }
      
//       // Only append image if a new one is selected
//       if (imageFile) {
//         formDataToSend.append('image', imageFile);
//         console.log('Updating with new image:', imageFile.name);
//       } else {
//         console.log('Updating without new image');
//       }

//       console.log('Sending FormData to:', updateUrl);

//       const response = await apiClient.put(updateUrl, formDataToSend, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       // Validate response
//       if (!response.data || !response.data.id) {
//         throw new Error('Invalid response from server: missing product data');
//       }

//       // Ensure the response matches the Product interface
//       const updatedProductData: Product = {
//         ...editDialog.product,
//         ...response.data,
//         price: response.data.price.toString(),
//         categories: response.data.categories || editDialog.product.categories,
//         cart: response.data.cart || editDialog.product.cart,
//       };

//       // Update products state
//       setProducts(
//         products.map((product) =>
//           product.id === updatedProductData.id ? updatedProductData : product
//         )
//       );

//       setEditDialog({ open: false, product: null });
//       setImageFile(null);
//       toast.success('Product updated successfully.');
//     } catch (err: unknown) {
//       console.error('Error updating product:', err);
//       const errorMessage = err instanceof Error ? err.message : 'Unknown error';
//       toast.error(`Failed to update product: ${errorMessage}`);
//     }
//   };

//   return (
//     <div className="w-full py-5 lg:py-10">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-lg lg:text-2xl font-semibold">Product Showcase</h2>
//         <Link to="/products">
//           <Button className="text-[12px] md:text-sm" variant="outline">
//             Create Product
//           </Button>
//         </Link>
//       </div>

//       {error && (
//         <p className="text-red-500 mb-4">
//           {error instanceof Error ? error.message : 'Failed to load products.'}
//         </p>
//       )}
//       {loading ? (
//         <p>Loading products...</p>
//       ) : products.length === 0 ? (
//         <p>No products available.</p>
//       ) : (
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Image</TableHead>
//               <TableHead>Title</TableHead>
//               <TableHead>Price</TableHead>
//               <TableHead>Category</TableHead>
//               <TableHead>Stock Quantity</TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {products.map((product) => (
//               <TableRow key={product.id}>
//                 <TableCell>
//                   <img
//                     src={getImageUrl(product.image_url)}
//                     alt={product.name}
//                     className="w-16 h-16 object-cover rounded"
//                     onError={(e) => {
//                       console.error(`Failed to load image: ${product.image_url}`);
//                       e.currentTarget.src = '/placeholder-image.jpg';
//                     }}
//                   />
//                 </TableCell>
//                 <TableCell>{product.name}</TableCell>
//                 <TableCell>
//                   ${parseFloat(product.price).toFixed(2)}
//                   {product.discount_percentage > 0 &&
//                     ` (-${product.discount_percentage}%)`}
//                 </TableCell>
//                 <TableCell>
//                   {product.categories ? product.categories.name : 'No Category'}
//                 </TableCell>
//                 <TableCell>{product.stock_quantity}</TableCell>
//                 <TableCell>
//                   <div className="flex space-x-2">
//                     {/* Edit Dialog */}
//                     <Dialog
//                       open={editDialog.open && editDialog.product?.id === product.id}
//                       onOpenChange={(open) =>
//                         setEditDialog({ open, product: open ? product : null })
//                       }
//                     >
//                       <DialogTrigger asChild>
//                         <Button className="text-[12px] md:text-sm" variant="outline">
//                           Edit
//                         </Button>
//                       </DialogTrigger>
//                       <DialogContent>
//                         <DialogHeader>
//                           <DialogTitle>Edit Product</DialogTitle>
//                           <DialogDescription>
//                             Update the details for "{product.name}".
//                           </DialogDescription>
//                         </DialogHeader>
//                         <form onSubmit={handleUpdate} encType="multipart/form-data">
//                           <div className="grid gap-4 py-4">
//                             <div className="grid grid-cols-4 items-center gap-4">
//                               <label htmlFor="name" className="text-sm font-medium text-right">
//                                 Name
//                               </label>
//                               <Input
//                                 id="name"
//                                 name="name"
//                                 defaultValue={product.name}
//                                 className="col-span-3"
//                                 required
//                               />
//                             </div>
//                             <div className="grid grid-cols-4 items-center gap-4">
//                               <label htmlFor="price" className="text-sm font-medium text-right">
//                                 Price
//                               </label>
//                               <Input
//                                 id="price"
//                                 name="price"
//                                 type="number"
//                                 step="0.01"
//                                 defaultValue={parseFloat(product.price)}
//                                 className="col-span-3"
//                                 required
//                               />
//                             </div>
//                             <div className="grid grid-cols-4 items-center gap-4">
//                               <label htmlFor="stock_quantity" className="text-sm font-medium text-right">
//                                 Stock Quantity
//                               </label>
//                               <Input
//                                 id="stock_quantity"
//                                 name="stock_quantity"
//                                 type="number"
//                                 defaultValue={product.stock_quantity}
//                                 className="col-span-3"
//                                 required
//                               />
//                             </div>
//                             <div className="grid grid-cols-4 items-center gap-4">
//                               <label htmlFor="image" className="text-sm font-medium text-right">
//                                 Image
//                               </label>
//                               <Input
//                                 id="image"
//                                 name="file"
//                                 type="file"
//                                 accept="image/*"
//                                 className="col-span-3"
//                                 onChange={handleFileChange}
//                               />
//                             </div>
//                             <div className="grid grid-cols-4 items-center gap-4">
//                               <label htmlFor="discount_percentage" className="text-sm font-medium text-right">
//                                 Discount (%)
//                               </label>
//                               <Input
//                                 id="discount_percentage"
//                                 name="discount_percentage"
//                                 type="number"
//                                 defaultValue={product.discount_percentage}
//                                 className="col-span-3"
//                               />
//                             </div>
//                           </div>
//                           <DialogFooter>
//                             <Button
//                               type="button"
//                               variant="outline"
//                               className="text-[12px] md:text-sm"
//                               onClick={() => {
//                                 setEditDialog({ open: false, product: null });
//                                 setImageFile(null);
//                               }}
//                             >
//                               Cancel
//                             </Button>
//                             <Button className="text-[12px] md:text-sm" type="submit">
//                               Save
//                             </Button>
//                           </DialogFooter>
//                         </form>
//                       </DialogContent>
//                     </Dialog>

//                     {/* Delete Dialog */}
//                     <Dialog
//                       open={deleteDialog.open && deleteDialog.productId === product.id}
//                       onOpenChange={(open) =>
//                         setDeleteDialog({ open, productId: open ? product.id : null })
//                       }
//                     >
//                       <DialogTrigger asChild>
//                         <Button className="text-[12px] md:text-sm" variant="destructive">
//                           Delete
//                         </Button>
//                       </DialogTrigger>
//                       <DialogContent>
//                         <DialogHeader>
//                           <DialogTitle>Delete Product</DialogTitle>
//                           <DialogDescription>
//                             Are you sure you want to delete "{product.name}"? This action cannot be undone.
//                           </DialogDescription>
//                         </DialogHeader>
//                         <DialogFooter>
//                           <Button
//                             variant="outline"
//                             className="text-[12px] md:text-sm"
//                             onClick={() => setDeleteDialog({ open: false, productId: null })}
//                           >
//                             Cancel
//                           </Button>
//                           <Button
//                             className="text-[12px] md:text-sm"
//                             variant="destructive"
//                             onClick={() => handleDelete(product.id)}
//                           >
//                             Delete
//                           </Button>
//                         </DialogFooter>
//                       </DialogContent>
//                     </Dialog>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       )}
//     </div>
//   );
// };

// export default ProductShowcase;





































import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/context/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { useAuthStore } from '@/context/userContext';

// Define Product interface
interface Product {
  id: number;
  name: string;
  price: string;
  stock_quantity: number;
  image_url: string;
  categories: { id: number; name: string } | null;
  discount_percentage: number;
  cart: { id: number; product_id: number; quantity: number }[];
}

// Define FetchResult interface
interface FetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Custom useFetch hook
function useFetch<T>(
  url: string,
  options: { method?: string; headers?: Record<string, string> } = {}
): FetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient({
          url,
          method: options.method || 'GET',
          headers: options.headers || { 'Content-Type': 'application/json' },
        });
        
        // Handle both direct data and { success: true, data: [...] } formats
        const resultData = response.data.data !== undefined ? response.data.data : response.data;
        setData(resultData);
      } catch (err: any) {
        // If it's a 404 error, we treat it as empty data (no products yet)
        if (err.response && err.response.status === 404) {
          setData([] as unknown as T);
          setError(null);
        } else {
          const error = err instanceof Error ? err : new Error('Unknown error');
          setError(error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url, options.method, options.headers]);

  return { data, loading, error };
}

const ProductShowcase: React.FC = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: number | null }>({
    open: false,
    productId: null,
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    product: Product | null;
  }>({
    open: false,
    product: null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) {
      console.warn('No image_url provided, using placeholder');
      return '/placeholder-image.jpg';
    }
    return imageUrl;
  };

  // Determine endpoint based on role
  const fetchUrl = user?.role === 'client_admin' 
    ? `/api/products/merchant/${user.id}` 
    : '/api/products';

  // Fetch products using useFetch
  const { data, loading, error } = useFetch<Product[]>(fetchUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  useEffect(() => {
    if (data) {
      console.log('Fetched products:', data);
      data.forEach((product: Product) => {
        const fullUrl = getImageUrl(product.image_url);
        console.log(`Product: ${product.name}, Raw image_url: ${product.image_url}, Full URL: ${fullUrl}`);
      });
      setProducts(data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      console.error('Error fetching products:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to load products: ${errorMessage}`);
    }
  }, [error]);

  // Handle file input change with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, or GIF).');
        setImageFile(null);
        return;
      }
      if (file.size > maxSize) {
        toast.error('Image size must be less than 5MB.');
        setImageFile(null);
        return;
      }
    }
    setImageFile(file);
  };

  // Handle product deletion
  const handleDelete = async (productId: number) => {
    try {
      const deleteUrl = `/api/products/${productId}`;
      console.log(`Sending DELETE request to: ${deleteUrl}`);
      await apiClient.delete(deleteUrl);

      setProducts(products.filter((product) => product.id !== productId));
      setDeleteDialog({ open: false, productId: null });
      toast.success('Product deleted successfully.');
    } catch (err: unknown) {
      console.error('Error deleting product:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to delete product: ${errorMessage}`);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editDialog.product) return;

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const priceStr = formData.get('price') as string;
      const stockStr = formData.get('stock_quantity') as string;
      const discountStr = formData.get('discount_percentage') as string;

      // Validation
      const missingFields: string[] = [];
      if (!name.trim()) missingFields.push('name');
      if (!priceStr) missingFields.push('price');
      if (!stockStr) missingFields.push('stock quantity');
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const price = parseFloat(priceStr);
      const stock_quantity = parseInt(stockStr, 10);
      const discount_percentage = discountStr ? parseInt(discountStr, 10) : 0;

      if (isNaN(price) || price <= 0) {
        throw new Error('Price must be a positive number');
      }
      if (isNaN(stock_quantity) || stock_quantity < 0) {
        throw new Error('Stock quantity must be a non-negative integer');
      }
      if (discount_percentage < 0) {
        throw new Error('Discount percentage cannot be negative');
      }

      const updateUrl = `/api/products/${editDialog.product.id}`;

      // ALWAYS send FormData (backend expects multipart/form-data)
      const formDataToSend = new FormData();
      formDataToSend.append('name', name);
      formDataToSend.append('price', priceStr);
      formDataToSend.append('stock_quantity', stockStr);
      formDataToSend.append('discount_percentage', discountStr || '0');
      formDataToSend.append('description', '');
      if (editDialog.product.categories?.id) {
        formDataToSend.append('category_id', editDialog.product.categories.id.toString());
      }
      
      // Only append image if a new one is selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
        console.log('Updating with new image:', imageFile.name);
      } else {
        console.log('Updating without new image');
      }

      console.log('Sending FormData to:', updateUrl);

      const response = await apiClient.put(updateUrl, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Validate response
      if (!response.data || !response.data.id) {
        throw new Error('Invalid response from server: missing product data');
      }

      // Ensure the response matches the Product interface
      const updatedProductData: Product = {
        ...editDialog.product,
        ...response.data,
        price: response.data.price.toString(),
        categories: response.data.categories || editDialog.product.categories,
        cart: response.data.cart || editDialog.product.cart,
      };

      // Update products state
      setProducts(
        products.map((product) =>
          product.id === updatedProductData.id ? updatedProductData : product
        )
      );

      setEditDialog({ open: false, product: null });
      setImageFile(null);
      toast.success('Product updated successfully.');
    } catch (err: unknown) {
      console.error('Error updating product:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to update product: ${errorMessage}`);
    }
  };

  return (
    <div className="w-full py-5 lg:py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg lg:text-2xl font-semibold">Product Showcase</h2>
        <Link to="/products">
          <Button className="text-[12px] md:text-sm" variant="outline">
            Create Product
          </Button>
        </Link>
      </div>

      {error && (
        <p className="text-red-500 mb-4">
          {error instanceof Error ? error.message : 'Failed to load products.'}
        </p>
      )}
      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500 italic py-10 text-center border rounded-lg bg-gray-50">
          No product created yet. Click "Create Product" to get started!
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock Quantity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={getImageUrl(product.image_url)}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      console.error(`Failed to load image: ${product.image_url}`);
                      e.currentTarget.src = '/placeholder-image.jpg';
                    }}
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  ${parseFloat(product.price).toFixed(2)}
                  {product.discount_percentage > 0 &&
                    ` (-${product.discount_percentage}%)`}
                </TableCell>
                <TableCell>
                  {product.categories ? product.categories.name : 'No Category'}
                </TableCell>
                <TableCell>{product.stock_quantity}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {/* Edit Dialog */}
                    <Dialog
                      open={editDialog.open && editDialog.product?.id === product.id}
                      onOpenChange={(open) =>
                        setEditDialog({ open, product: open ? product : null })
                      }
                    >
                      <DialogTrigger asChild>
                        <Button className="text-[12px] md:text-sm" variant="outline">
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Product</DialogTitle>
                          <DialogDescription>
                            Update the details for "{product.name}".
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} encType="multipart/form-data">
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="name" className="text-sm font-medium text-right">
                                Name
                              </label>
                              <Input
                                id="name"
                                name="name"
                                defaultValue={product.name}
                                className="col-span-3"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="price" className="text-sm font-medium text-right">
                                Price
                              </label>
                              <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                defaultValue={parseFloat(product.price)}
                                className="col-span-3"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="stock_quantity" className="text-sm font-medium text-right">
                                Stock Quantity
                              </label>
                              <Input
                                id="stock_quantity"
                                name="stock_quantity"
                                type="number"
                                defaultValue={product.stock_quantity}
                                className="col-span-3"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="image" className="text-sm font-medium text-right">
                                Image
                              </label>
                              <Input
                                id="image"
                                name="file"
                                type="file"
                                accept="image/*"
                                className="col-span-3"
                                onChange={handleFileChange}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="discount_percentage" className="text-sm font-medium text-right">
                                Discount (%)
                              </label>
                              <Input
                                id="discount_percentage"
                                name="discount_percentage"
                                type="number"
                                defaultValue={product.discount_percentage}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              className="text-[12px] md:text-sm"
                              onClick={() => {
                                setEditDialog({ open: false, product: null });
                                setImageFile(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button className="text-[12px] md:text-sm" type="submit">
                              Save
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>

                    {/* Delete Dialog */}
                    <Dialog
                      open={deleteDialog.open && deleteDialog.productId === product.id}
                      onOpenChange={(open) =>
                        setDeleteDialog({ open, productId: open ? product.id : null })
                      }
                    >
                      <DialogTrigger asChild>
                        <Button className="text-[12px] md:text-sm" variant="destructive">
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Product</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            className="text-[12px] md:text-sm"
                            onClick={() => setDeleteDialog({ open: false, productId: null })}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="text-[12px] md:text-sm"
                            variant="destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ProductShowcase;