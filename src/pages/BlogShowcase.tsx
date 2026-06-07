import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { BlogPostSM } from '@/lib/schemas/blogs/blog';
import { apiClient } from '@/context/axios';
import { GetBlogs, UpdateBlog } from '@/api';
import { useAuthStore } from '@/context/userContext';

const BlogShowcase: React.FC = () => {
  const { user } = useAuthStore();
  const [blogs, setBlogs] = useState<BlogPostSM[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; blogId: number | null }>({
    open: false,
    blogId: null,
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    blog: BlogPostSM | null;
  }>({
    open: false,
    blog: null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Base URL for backend (for image normalization)
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dimpo-pbackend.onrender.com';

  // Normalize image URL
  const getImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) {
      return '/placeholder-image.jpg';
    }
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${BASE_URL}${imageUrl}`;
  };

  // Fetch all blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Pass user.id if logged in to filter by merchant
        const response = await GetBlogs(undefined, undefined, user?.id);
        setBlogs(response.data); // Extract the data array
      } catch (err: any) {
        // Handle 404 specifically as "no blogs yet"
        if (err.message && (err.message.includes('404') || err.message.includes('not found'))) {
          setBlogs([]);
          setError(null);
        } else {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          setError(`Failed to load blogs: ${errorMessage}`);
          toast.error(`Failed to load blogs: ${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [user?.id]);

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

  // Handle blog deletion
  const handleDelete = async (blogId: number) => {
    try {
      await apiClient.delete(`/api/blogs/${blogId}`);
      setBlogs(blogs.filter((blog) => blog.id !== blogId));
      setDeleteDialog({ open: false, blogId: null });
      toast.success('Blog deleted successfully.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to delete blog: ${errorMessage}`);
    }
  };

  // Handle blog update
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editDialog.blog) return;

    try {
      const form = new FormData(e.currentTarget);
      const title = form.get('title') as string;
      const status = form.get('status') as string;

      // Validation
      const missingFields: string[] = [];
      if (!title?.trim()) missingFields.push('title');
      if (!status) missingFields.push('status');
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Prepare data for update
      const formData = new FormData();
      formData.append('title', title);
      formData.append('status', status);
      if (imageFile) {
        formData.append('hero_image', imageFile);
      }

      const response = await UpdateBlog(editDialog.blog.id.toString(), formData);

      if (!response.title) {
        throw new Error('Invalid response from server: missing title');
      }

      setBlogs(blogs.map((blog) => (blog.id === response.id ? response : blog)));
      setEditDialog({ open: false, blog: null });
      setImageFile(null);
      toast.success('Blog updated successfully.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to update blog: ${errorMessage}`);
    }
  };

  return (
    <div className="w-full  py-5  lg:py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg lg:text-2xl font-semibold">Blog Showcase</h2>
        <Link to="/blogs">
          <Button className="text-[12px] md:text-sm"
          variant="outline"
          >Create Blog</Button>
        </Link>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          <p>{error}</p>
          <p>Please check the console for more details.</p>
        </div>
      )}
      {loading ? (
        <p>Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No blog post created yet. Click 'Create Blog' to get started!</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hero Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Author Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell>
                  <img
                    src={getImageUrl(blog.hero_image)}
                    alt={blog.title || 'Blog Hero Image'}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.jpg';
                    }}
                  />
                </TableCell>
                <TableCell>{blog.title || 'No Title'}</TableCell>
                <TableCell>{blog.meta_author || 'Unknown Author'}</TableCell>
                <TableCell>{blog.status || 'Unknown'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {/* Edit Dialog */}
                    <Dialog
                      open={editDialog.open && editDialog.blog?.id === blog.id}
                      onOpenChange={(open) =>
                        setEditDialog({ open, blog: open ? blog : null })
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                         className='text-[12px] md:text-sm'
                        variant="outline">Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Blog</DialogTitle>
                          <DialogDescription>
                            Update the details for "{blog.title || 'Untitled'}".
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} encType="multipart/form-data">
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label
                                htmlFor="title"
                                className="text-sm font-medium text-right"
                              >
                                Title
                              </label>
                              <Input
                                id="title"
                                name="title"
                                defaultValue={blog.title || ''}
                                className="col-span-3"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label
                                htmlFor="status"
                                className="text-sm font-medium text-right"
                              >
                                Status
                              </label>
                              <Select
                                name="status"
                                defaultValue={blog.status || 'visible'}
                                required
                              >
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="visible">Visible</SelectItem>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label
                                htmlFor="hero_image"
                                className="text-sm font-medium text-right"
                              >
                                Hero Image
                              </label>
                              <Input
                                id="hero_image"
                                name="hero_image"
                                type="file"
                                accept="image/*"
                                className="col-span-3"
                                onChange={handleFileChange}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              className='text-[12px] md:text-sm'
                              onClick={() => {
                                setEditDialog({ open: false, blog: null });
                                setImageFile(null);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                             className='text-[12px] md:text-sm'
                            type="submit">Save</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    {/* Delete Dialog */}
                    <Dialog
                      open={deleteDialog.open && deleteDialog.blogId === blog.id}
                      onOpenChange={(open) =>
                        setDeleteDialog({ open, blogId: open ? blog.id : null })
                      }
                    >
                      <DialogTrigger asChild>
                        <Button
                         className='text-[12px] md:text-sm'
                        variant="destructive">Delete</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Blog</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{blog.title || 'Untitled'}"? This
                            action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-2">
                          <Button
                           className='text-[12px] md:text-sm'
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, blogId: null })}
                          >
                            Cancel
                          </Button>
                          <Button
                           className='text-[12px] md:text-sm'
                          variant="destructive" onClick={() => handleDelete(blog.id)}>
                            Delete
                          </Button>
                        </div>
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

export default BlogShowcase;