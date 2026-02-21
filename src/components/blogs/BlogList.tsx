import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { GetBlogs } from '@/api';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogCard {
  id: number;
  img: string;
  type: string;
  des: string;
  date: string;
}

const BlogList = () => {
  const [blogs, setBlogs] = useState<BlogCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await GetBlogs(page, limit);
        
        const transformedBlogs = response.data.map((blog: any) => ({
          id: blog.id,
          img: blog.blog_images?.[0]?.image_url || blog.hero_image || '/placeholder-image.jpg',
          type: blog.title || 'No Title',
          des: blog.description || blog.content || 'No content available',
          date: blog.created_at
        }));
        
        setBlogs(transformedBlogs);
        setTotalPages(response.meta.totalPages);
      } catch (err) {
        setError('Failed to load blogs');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
    window.scrollTo(0, 0);
  }, [page]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => setPage(page)} 
          className="px-6 py-2 bg-buttons text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-montserratBold mb-4">Our Blog</h1>
        <p className="text-gray-600 max-w-2xl mx-auto font-montserrat">
          Stay updated with the latest trends, insights, and stories from our team.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[300px] w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {blogs.map((blog) => (
              <NavLink 
                key={blog.id} 
                to={`/blog/${blog.id}`}
                className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={blog.img}
                    alt={blog.type}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = '/placeholder-image.jpg'; }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800">
                      {new Date(blog.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-montserratBold mb-3 group-hover:text-buttons transition-colors line-clamp-2">
                    {blog.type}
                  </h3>
                  <div 
                    className="text-gray-600 text-sm font-montserrat line-clamp-3 mb-4"
                    dangerouslySetInnerHTML={{ __html: blog.des }}
                  />
                  <div className="mt-auto flex items-center text-buttons font-semibold text-sm">
                    Read More <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </NavLink>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`p-2 rounded-full border ${page === 1 ? 'text-gray-300' : 'hover:bg-gray-50'}`}
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-colors ${
                      page === i + 1 
                        ? 'bg-buttons text-white' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`p-2 rounded-full border ${page === totalPages ? 'text-gray-300' : 'hover:bg-gray-50'}`}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogList;
