import { useParams } from 'react-router-dom';
import { GetBlogById } from '@/api';
import { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { BlogPostSM } from '@/components/interfaces/blog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

const Blog = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState<BlogPostSM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          throw new Error('No blog ID provided');
        }

        const response = await GetBlogById(id);
        
        if (!response) {
          throw new Error('Blog not found');
        }

        setBlog(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog');
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  // ALL 13 IMAGES - FIXED!
  const getCarouselImages = () => {
    if (!blog) return [];
    
    const images = [
    
      blog.image_url,
      blog.hero_image,
      blog.blog_image_one,
      blog.blog_image_two,
      blog.blog_image_three,
      
      blog.meta_og_image,
      ...(blog.blog_images?.map((img) => img.image_url) || [])
    ];

    return images.filter((img): img is string => !!img);
  };

  const renderContentSection = (content?: string, className = '') => {
    if (!content) return null;
    
    return (
      <div 
        className={`prose max-w-none mb-4 ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  const renderKeyPoint = (
    title?: string,
    description?: string,
    image?: string,
    index: number = 0
  ) => {
    if (!title && !description) return null;

    return (
      <div key={index} className="mb-8">
        {title && <h3 className="text-xl font-bold mb-2">{title}</h3>}
        {description && renderContentSection(description)}
        {image && (
          <div className="mt-4 flex justify-center">
            <img
              src={image}
              alt={title || `Blog image ${index}`}
              className="max-h-96 object-contain rounded-lg border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="px-4 md:px-8 lg:px-16 py-12">
        <Skeleton className="h-8 w-3/4 mb-6" />
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-8 lg:px-16 py-12">
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="px-4 md:px-8 lg:px-16 py-12">
        <Alert>
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>The requested blog could not be found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const carouselImages = getCarouselImages();

  return (
    <div className="px-4 flex flex-col justify-center items-center md:px-8 lg:px-16 pt-24 pb-12.5  lg:py-30 max-w-6xl mx-auto">
      {/* Author Avatar */}
      {blog.author_avatar && (
        <div className="flex items-center justify-center flex-col w-full gap-3 mb-6">
          <img 
            src={blog.author_avatar} 
            alt="Author" 
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {blog.meta_author && (
            <span className="text-sm text-gray-600">{blog.meta_author}</span>
          )}
        </div>
      )}

      <h1 className="text-3xl text-center md:text-4xl lg:text-5xl font-bold mb-6">{blog.title}</h1>
      
      {/* Description */}
      {blog.description && (
        <p className="text-lg text-center text-gray-600 mb-6">{blog.description}</p>
      )}
      
      {/* Carousel for images */}
      {carouselImages.length > 0 ? (
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
          <Carousel 
            showThumbs={false} 
            infiniteLoop 
            useKeyboardArrows 
            autoPlay
            showStatus={false}
            showArrows={carouselImages.length > 1}
            showIndicators={carouselImages.length > 1}
          >
            {carouselImages.map((img, index) => (
              <div key={index} className="h-[400px] md:h-[500px]    xl:h-[550px]   relative">
                <img 
                  src={img} 
                  alt={`Blog image ${index + 1}`}
                  className="h-full w-full    object-cover     md:object-contain "
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-blog.jpg';
                  }}
                />
              </div>
            ))}
          </Carousel>
        </div>
      ) : (
        <div className="mb-8 h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
          No images available
        </div>
      )}

      {/* Blog content sections - ALL FIELDS */}
      <div className="prose  flex flex-col justify-center items-center max-w-none">
        {blog.epigraph && (
          <blockquote className="text-xl italic border-l-4 pl-4 mb-6 text-gray-600">
            {blog.epigraph}
          </blockquote>
        )}

        {/* Main content field */}
        {renderContentSection(blog.content)}

        {/* All paragraph fields */}
        {renderContentSection(blog.first_paragraph)}
        {renderContentSection(blog.second_paragraph)}
        {renderContentSection(blog.third_paragraph)}
        {renderContentSection(blog.fourth_paragraph)}
        {renderContentSection(blog.fifth_paragraph)}

        {/* Key points section */}
        <div className="mt-8 space-y-8 flex flex-col text-center justify-center items-center">
          {renderKeyPoint(
            blog.point_one_title,
            blog.point_one_description,
            blog.annotation_image_one,
            1
          )}
          {renderKeyPoint(
            blog.point_two_title,
            blog.point_two_description,
            blog.annotation_image_two,
            2
          )}
          {renderKeyPoint(
            blog.point_three_title,
            blog.point_three_description,
            blog.annotation_image_three,
            3
          )}
          {renderKeyPoint(
            blog.point_four_title,
            blog.point_four_description,
            blog.annotation_image_four,
            4
          )}
          {renderKeyPoint(
            blog.point_five_title,
            blog.point_five_description,
            blog.annotation_image_five,
            5
          )}
        </div>

        {/* More blogs section */}
        {blog.more_blogs && (
          <div className="mt-8 text-center">
            <h3 className="text-2xl font-bold mb-4">More to Explore</h3>
            {renderContentSection(blog.more_blogs)}
          </div>
        )}
      </div>

      {/* Blog metadata - ALL META FIELDS */}
      <div className="mt-12 pt-6 border-t">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {blog.created_at && (
            <div>
              <span className="font-medium">Published: </span>
              {new Date(blog.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}
          {blog.categories && (
            <div>
              <span className="font-medium">Categories: </span>
              {blog.categories}
            </div>
          )}
          {blog.keywords && (
            <div>
              <span className="font-medium">Keywords: </span>
              {blog.keywords}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;