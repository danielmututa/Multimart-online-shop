

// import { ArrowRight } from 'lucide-react';
// import { NavLink } from 'react-router-dom';
// import { useState, useEffect } from 'react';
// import { GetBlogs } from '@/api';

// interface BlogCard {
//   id: number;
//   img: string;
//   type: string;
//   des: string;
//   btn: string;
// }

// const Blogs = () => {
//   const [blogs, setBlogs] = useState<BlogCard[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchBlogs = async () => {
//       try {
//         setLoading(true);
//         const response = await GetBlogs();
        
//         // Transform the backend data to match your frontend structure
//         const transformedBlogs = response.data.map((blog: any) => ({
//           id: blog.id,
//           img: blog.blog_images?.[0]?.image_url || blog.hero_image || '/placeholder-image.jpg',
//           type: blog.title || 'No Title',
//           des: blog.content || 'No content available',
//           btn: "Read Blog"
//         }));
        
//         setBlogs(transformedBlogs);
//       } catch (err) {
//         setError('Failed to load blogs');
//         console.error('Error fetching blogs:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBlogs();
//   }, []);

//   if (loading) {
//     return <div className="flex items-center justify-center py-[50px]">Loading blogs...</div>;
//   }

//   if (error) {
//     return <div className="flex items-center justify-center py-[50px] text-red-500">{error}</div>;
//   }

//   if (blogs.length === 0) {
//     return <div className="flex items-center justify-center py-[50px]">No blogs available.</div>;
//   }

//   return (
//     <div className="flex items-center justify-center py-[50px] px-[20px] md:px-[40px] md:py-[60px] lg:px-[80px] lg:py-[60px] xl:px-[100px] xl:py-[80px]">
//       <div className='flex flex-col md:flex-row md:flex-wrap gap-6 justify-between w-full'>
//         {blogs.map((card) => (
//           <div key={card.id} className="w-full  md:mb-0 md:w-[48%] lg:w-[30%] group">
//             <img
//               loading='lazy'
//               src={card.img}
//               alt={card.type}
//               className='h-[400px] md:h-[450px] lg:h-[450px] w-full object-cover'
//               onError={(e) => {
//                 e.currentTarget.src = '/placeholder-image.jpg';
//               }}
//             />


//             <div className="flex flex-col">


//             <p className="text-sm lg:text-[16px] font-montserrat text-gray-500 pt-[10px]">{card.type}</p>
//             <p className="text-[14px] font-montserratBold pt-[8px] pb-[8px] line-clamp-3">{card.des}</p>
//             </div>

//             <NavLink 
//               to={`/blog/${card.id}`} 
//               className="text-[16px] font-montserrat flex items-center gap-2 text-buttons underline"
//             >
//               {card.btn}
//               <ArrowRight className='group-hover:translate-x-2 duration-500' size={20} />
//             </NavLink>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default Blogs;














import { ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { GetBlogs } from '@/api';

interface BlogCard {
  id: number;
  img: string;
  type: string;
  des: string;
  btn: string;
}

const Blogs = () => {
  const [blogs, setBlogs] = useState<BlogCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        // Fetch with limit 3 and sort by newest
        const response = await GetBlogs(1, 100); // Fetch a few and sort client-side if limit is not handled by backend precisely as 3
        
        // Transform and sort by created_at descending
        const sortedBlogs = [...response.data]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);

        const transformedBlogs = sortedBlogs.map((blog: any) => ({
          id: blog.id,
          img: blog.blog_images?.[0]?.image_url || blog.hero_image || '/placeholder-image.jpg',
          type: blog.title || 'No Title',
          des: blog.description || blog.content || 'No content available',
          btn: "Read Blog"
        }));
        
        setBlogs(transformedBlogs);
      } catch (err) {
        setError('Failed to load blogs');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-[50px]">Loading blogs...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center py-[50px] text-red-500">{error}</div>;
  }

  if (blogs.length === 0) {
    return <div className="flex items-center justify-center py-[50px]">No blogs available.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center py-[50px] px-[20px] md:px-[40px] md:py-[60px] lg:px-[80px] lg:py-[60px] xl:px-[100px] xl:py-[80px]">
      <div className="w-full flex justify-between items-center mb-10">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-montserratBold">Latest News</h2>
        <NavLink 
          to="/blog" 
          className="text-sm md:text-base font-montserrat text-buttons hover:underline flex items-center gap-1"
        >
          View All Blogs <ArrowRight size={18} />
        </NavLink>
      </div>
      
      <div className='flex flex-col md:flex-row md:flex-wrap gap-6 justify-between w-full'>
        {blogs.map((card) => (
          <div key={card.id} className="w-full md:w-[48%] lg:w-[30%] group flex flex-col">
            <div className="overflow-hidden rounded-lg mb-4">
              <img
                loading='lazy'
                src={card.img}
                alt={card.type}
                className='h-[400px] md:h-[450px] lg:h-[350px] w-full object-cover transition-transform duration-500 group-hover:scale-105'
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.jpg';
                }}
              />
            </div>

            <div className="flex flex-col flex-grow">
              <p className="text-sm lg:text-[16px] font-montserrat text-gray-500">
                {card.type}
              </p>
              <p className="text-[14px] font-montserratBold pt-[8px] pb-[8px] line-clamp-3">
                {card.des}
              </p>
            </div>

            <NavLink 
              to={`/blog/${card.id}`} 
              className="text-[16px] font-montserrat flex items-center gap-2 text-buttons underline mt-2"
            >
              {card.btn}
              <ArrowRight className='group-hover:translate-x-2 duration-500' size={20} />
            </NavLink>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Blogs;
