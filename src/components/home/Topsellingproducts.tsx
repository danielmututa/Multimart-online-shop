

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/context/axios';
import { ProductSM } from '@/lib/schemas/products/Products';
import { useNavigate } from 'react-router-dom';

const Topsellingproducts: React.FC = () => {
  const [products, setProducts] = useState<ProductSM[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Individual active indices for each carousel block
  const [indices, setIndices] = useState({
    fresh: 0,
    exclusive: 0,
    hot: 0,
    sale70: 0,
    beyond: 0
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get('/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products for each section
  // freshFinds: newest 5 products
  const freshFinds = [...products]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  
  // exclusives: products with most views
  const exclusives = [...products]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);
  
  // hotDeals: highest discount percentages
  const hotDeals = products
    .filter(p => p.discount_percentage > 0)
    .sort((a, b) => b.discount_percentage - a.discount_percentage)
    .slice(0, 5);
  
  // sale70: specifically high discounts (>= 50%)
  const sale70 = products
    .filter(p => p.discount_percentage >= 50)
    .slice(0, 5);
  
  // smartphones: based on category name
  const smartphones = products
    .filter(p => p.categories?.name?.toLowerCase().includes('phone') || p.name.toLowerCase().includes('iphone'))
    .slice(0, 5);

  // Auto-cycle effect every 5 seconds
  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setIndices(prev => ({
        fresh: freshFinds.length > 0 ? (prev.fresh + 1) % freshFinds.length : 0,
        exclusive: exclusives.length > 0 ? (prev.exclusive + 1) % exclusives.length : 0,
        hot: hotDeals.length > 0 ? (prev.hot + 1) % hotDeals.length : 0,
        sale70: sale70.length > 0 ? (prev.sale70 + 1) % sale70.length : 0,
        beyond: smartphones.length > 0 ? (prev.beyond + 1) % smartphones.length : 0,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [freshFinds.length, exclusives.length, hotDeals.length, sale70.length, smartphones.length, products.length]);

  if (loading) return null;

  return (
    <div className='flex justify-center items-center flex-col px-[20px] py-[50px] md:px-[40px] md:py-[60px] lg:py-[60px] lg:px-[80px] xl:py-20 xl:px-[100px]'>
      <h2 className='text-[20px] pb-2 md:text-[23px] font-montserratBold lg:text-[26px] xl:text-[36px] uppercase tracking-wider'>
        Top Selling Products
      </h2>
      <p className='text-sm pb-8 text-center md:text-[16px] lg:text-lg text-gray-500 max-w-4xl'>
        Explore our curated selection of top-performing gadgets and lifestyle essentials. Each item blends innovation, stylish design, and reliable performance.
      </p>

      <div className="flex flex-col lg:flex-row lg:justify-between w-full gap-5">
        
        {/* LARGE LEFT BLOCK - Fresh Finds Carousel */}
        <div className="w-full lg:w-[49%] h-[400px] lg:h-[480px] relative overflow-hidden group rounded-2xl shadow-xl border border-gray-100">
           {freshFinds.length > 0 ? freshFinds.map((product, i) => (
             <div 
               key={product.id} 
               className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                 i === indices.fresh ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
               }`}
             >
               <img 
                 src={product.image_url} 
                 className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700' 
                 alt={product.name} 
                 onError={(e) => { (e.target as HTMLImageElement).src = '/api/products/placeholder.jpg'; }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
               <div className="absolute bottom-0 left-0 p-8 flex flex-col gap-2 w-full">
                 <h4 className='text-white font-montserratBold text-xs uppercase tracking-[0.2em] bg-buttons px-4 py-1.5 w-fit rounded-full shadow-lg'>
                   New Arrival
                 </h4>
                 <h2 className='text-3xl lg:text-4xl font-montserratBold text-white drop-shadow-md'>{product.name}</h2>
                 <p className='text-white/80 font-montserrat max-w-md'>Fresh finds for tech enthusiasts. Upgrade with the latest gadgets.</p>
                 <button 
                   onClick={() => navigate('/shop')} 
                   className='mt-4 bg-white/10 backdrop-blur-md border border-white/30 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-buttons hover:border-buttons transition-all w-fit shadow-lg group/btn'
                 >
                   Discover more 
                   <span className='group-hover/btn:translate-x-1 transition-transform'>→</span>
                 </button>
               </div>
             </div>
           )) : (
             <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">Loading New Arrivals...</div>
           )}
        </div>

        {/* RIGHT GRID CAROUSELS */}
        <div className="w-full lg:w-[49%] grid grid-cols-2 gap-4">
           
           {/* Online Exclusive Carousel */}
           <div className="h-[230px] lg:h-[235px] relative overflow-hidden group rounded-xl shadow-lg border border-gray-100 bg-gray-50">
             {exclusives.length > 0 ? exclusives.map((product, i) => (
               <div key={product.id} className={`absolute inset-0 transition-opacity duration-700 ${i === indices.exclusive ? 'opacity-100' : 'opacity-0'}`}>
                 <img src={product.image_url} className='w-full h-full object-cover group-hover:scale-105 transition-transform' alt={product.name} />
                 <div className="absolute inset-x-0 top-0 p-4 text-right bg-gradient-to-b from-black/60 to-transparent">
                   <h4 className='text-white font-montserratBold text-xs uppercase tracking-widest'>Online Exclusive</h4>
                   <p onClick={() => navigate('/shop')} className='text-buttons font-montserratBold text-sm mt-1 underline cursor-pointer hover:text-white transition-colors uppercase'>Shop Now</p>
                 </div>
               </div>
             )) : <div className="p-4 flex h-full items-center justify-center text-gray-300">Loading...</div>}
           </div>

           {/* Hot Deals Carousel */}
           <div className="h-[230px] lg:h-[235px] relative overflow-hidden group rounded-xl shadow-lg border border-gray-100 bg-gray-50">
             {hotDeals.length > 0 ? hotDeals.map((product, i) => (
               <div key={product.id} className={`absolute inset-0 transition-opacity duration-700 ${i === indices.hot ? 'opacity-100' : 'opacity-0'}`}>
                 <img src={product.image_url} className='w-full h-full object-cover group-hover:scale-105 transition-transform' alt={product.name} />
                 <div className="absolute bottom-4 right-0 px-4 py-2 bg-white text-buttons font-montserratBold shadow-xl group-hover:bg-buttons group-hover:text-white transition-all transform group-hover:-translate-x-2">
                   Hot Deal! -{product.discount_percentage}%
                 </div>
               </div>
             )) : <div className="p-4 flex h-full items-center justify-center text-gray-300">Searching Deals...</div>}
           </div>

           {/* 70% SALE (or high discounts) Carousel */}
           <div className="h-[235px] lg:h-[235px] relative overflow-hidden group rounded-xl shadow-lg border border-gray-100 bg-gray-50">
             {sale70.length > 0 ? sale70.map((product, i) => (
               <div key={product.id} className={`absolute inset-0 transition-opacity duration-700 ${i === indices.sale70 ? 'opacity-100' : 'opacity-0'}`}>
                 <img src={product.image_url} className='w-full h-full object-cover group-hover:scale-105 transition-transform' alt={product.name} />
                 <div className="absolute bottom-4 left-0 px-5 py-2.5 bg-red-600 text-white font-montserratBold shadow-2xl skew-x-[-10deg] transform hover:skew-x-0 transition-all">
                   <span className='inline-block skew-x-[10deg] group-hover:scale-110'>{product.discount_percentage}% OFF SALE</span>
                 </div>
               </div>
             )) : <div className="p-4 flex h-full items-center justify-center text-gray-300 text-center uppercase text-xs font-bold">Limited Availability</div>}
           </div>

           {/* Smartphones Beyond Carousel (Product Name Focused) */}
           <div className="h-[235px] lg:h-[235px] relative overflow-hidden group rounded-xl shadow-2xl border border-gray-800 bg-gray-900">
             {smartphones.length > 0 ? smartphones.map((product, i) => (
               <div key={product.id} className={`absolute inset-0 transition-all duration-1000 ${i === indices.beyond ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                 <img src={product.image_url} className='w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity blur-[1px] group-hover:blur-0 duration-500' alt={product.name} />
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                   <div className="w-1.5 h-12 bg-buttons mb-4 rounded-full animate-bounce shadow-[0_0_15px_rgba(102,0,238,0.8)]" />
                   <h4 className='text-white font-montserratBold text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-2'>
                     {product.name}
                   </h4>
                   <span className='text-buttons text-[10px] font-bold uppercase tracking-[0.3em] mt-3 group-hover:tracking-[0.5em] transition-all duration-500'>Beyond Smartphones</span>
                 </div>
               </div>
             )) : <div className="p-4 flex h-full items-center justify-center text-white/20 text-center uppercase text-xs font-bold">Smartphones Beyond!</div>}
           </div>

        </div>

      </div>
    </div>
  );
};

export default Topsellingproducts;