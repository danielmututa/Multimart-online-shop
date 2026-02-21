

// import  { useState, useEffect} from 'react'
// import newsimg from "../Images/news-image.png"


// const News = () => {

//     const [timeLeft, setTimeLeft] = useState({
//         days: 0,
//         hours: 0,
//         minutes: 0,
//         seconds: 0
//       });
    
     
//   useEffect(() => {
//     // Set your target date here
//     const targetDate = new Date('2024-12-31T23:59:59').getTime();

//     const interval = setInterval(() => {
//       const now = new Date().getTime();
//       const difference = targetDate - now;

//       if (difference > 0) {
//         const days = Math.floor(difference / (1000 * 60 * 60 * 24));
//         const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//         const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
//         const seconds = Math.floor((difference % (1000 * 60)) / 1000);

//         setTimeLeft({ days, hours, minutes, seconds });
//       } else {
//         clearInterval(interval);
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);



//   return (
//     <div className='h-[350px]  relative lg:h-[450px]'>
//         <img loading='lazy' src={newsimg} className='object-cover w-full h-full' alt="" />
//         <div className=" left-5 gap-2   absolute  lg:left-[100px]  top-0  flex justify-center  h-full flex-col lg:gap-3">
//           <h4 className='text-[16px] md:text-[16px]  font-montserratBold  lg:text-[16px] text-white'>  Fresh Updates & Trends</h4>
//            <h1 className='text-[24px] md:text-[28px]  font-montserratBold lg:text-[32px] xl:text-[36px] text-white'> Upcoming Launch Countdown</h1>
//            <div className="p-[2px] border w-[70px] border-solid rounded-s-[10px] bg-white lg:p-1"><span></span></div>

//            {/* {{TIME ? TIME}} */}
           

//            <div className="gap-3 mt-3 flex lg:gap-8 items-center lg:mt-4">
//       <div className="flex flex-col items-center border py-2 px-4  ">
//         <span className="text-[25px] md:text-[28px] font-bold font-montserratBold lg:text-3xl text-white">{timeLeft.days}</span>
//         <span className="text-sm font-montserratBold text-white">days</span>
//       </div>
//       <div className="flex flex-col items-center  border py-2 px-4">
//         <span className="text-[25px] md:text-[28px] font-bold lg:text-3xl font-montserratBold text-white">{timeLeft.hours}</span>
//         <span className="text-sm font-montserratBold text-white">hours</span>
//       </div>
//       <div className="flex flex-col items-center  border py-2 px-4">
//         <span className=" text-[25px] md:text-[28px] font-bold font-montserratBold lg:text-3xl text-white">{timeLeft.minutes}</span>
//         <span className="text-sm font-montserratBold text-white">mins</span>
//       </div>
//       <div className="flex flex-col items-center  border py-2 px-4">
//         <span className="text-[25px] md:text-[28px]  font-bold font-montserratBold lg:text-3xl text-white">{timeLeft.seconds}</span>
//         <span className="text-sm font-montserratBold text-white">secs</span>
//       </div>
//     </div>
// <div className="flex gap-3">
// <p className="text-buttons/80 line-through text-[20px] font-montserratBold">$220.00</p>
// <p className='text-[20px] font-montserratBold text-buttons'>$180.00</p>
// </div>
  
//             </div>


     

//     </div>
//   )
// }

// export default News






import { useState, useEffect } from 'react';
import { apiClient } from '@/context/axios';
import { ProductSM } from '@/lib/schemas/products/Products';
import { useNavigate } from 'react-router-dom';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const News = () => {
  const [discountedProducts, setDiscountedProducts] = useState<ProductSM[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const fetchDiscountedProducts = async () => {
    try {
      const response = await apiClient.get('/api/products');
      const products: ProductSM[] = response.data;
      // Filter for products with discounts
      const discounted = products.filter(p => p.discount_percentage > 0);
      setDiscountedProducts(discounted);
    } catch (error) {
      console.error('Failed to fetch discounted products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountedProducts();
  }, []);

  // Cycle every 5 minutes (300000ms) as requested by user
  useEffect(() => {
    if (discountedProducts.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % discountedProducts.length);
      }, 300000); 
      return () => clearInterval(interval);
    }
  }, [discountedProducts.length]);

  useEffect(() => {
    // Current year-end as a placeholder for sale end
    const targetDate = new Date('2025-12-31T23:59:59').getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;
  if (discountedProducts.length === 0) return null;

  return (
    <div className='h-[400px] relative lg:h-[500px] overflow-hidden group'>
      {discountedProducts.map((product, index) => {
        const originalPrice = parseFloat(product.price);
        const discountedPrice = (originalPrice * (1 - product.discount_percentage / 100)).toFixed(2);
        
        return (
          <div 
            key={product.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
              index === activeIndex 
                ? 'opacity-100 scale-100 translate-x-0' 
                : 'opacity-0 scale-105 translate-x-10'
            }`}
          >
            <img 
              loading='lazy' 
              src={product.image_url} 
              className='object-cover w-full h-full' 
              alt={product.name} 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder-image.jpg";
              }}
            />
            {/* Dark gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            
            <div className="left-5 lg:left-[100px] top-0 absolute flex justify-center h-full flex-col gap-2 lg:gap-4 z-10 w-full lg:w-1/2 p-4">
              <div className='flex items-center gap-2 bg-buttons text-white w-fit px-4 py-1.5 rounded-full shadow-lg transform -rotate-1'>
                <span className='animate-pulse'>🔥</span>
                <span className='text-sm font-montserratBold uppercase tracking-wider'>Hot Deal! -{product.discount_percentage}% OFF</span>
              </div>
              
              <h1 className='text-[32px] md:text-[40px] lg:text-[56px] font-montserratBold text-white leading-tight drop-shadow-2xl'>
                {product.name}
              </h1>
              
              <div className="w-[120px] h-[5px] bg-buttons rounded-full shadow-[0_0_15px_rgba(102,0,238,0.5)]"></div>

              <div className="gap-3 mt-4 flex lg:gap-8 items-center lg:mt-6">
                <div className="flex flex-col items-center border-[1px] border-white/30 px-3 py-2 bg-black/40 backdrop-blur-md rounded-xl min-w-[75px] shadow-lg">
                  <span className="text-[26px] font-bold text-white leading-none font-montserratBold">{timeLeft.days}</span>
                  <span className="text-[10px] uppercase tracking-[2px] text-gray-300 font-bold mt-1">days</span>
                </div>
                <div className="flex flex-col items-center border-[1px] border-white/30 px-3 py-2 bg-black/40 backdrop-blur-md rounded-xl min-w-[75px] shadow-lg">
                  <span className="text-[26px] font-bold text-white leading-none font-montserratBold">{timeLeft.hours}</span>
                  <span className="text-[10px] uppercase tracking-[2px] text-gray-300 font-bold mt-1">hrs</span>
                </div>
                <div className="flex flex-col items-center border-[1px] border-white/30 px-3 py-2 bg-black/40 backdrop-blur-md rounded-xl min-w-[75px] shadow-lg">
                  <span className="text-[26px] font-bold text-white leading-none font-montserratBold">{timeLeft.minutes}</span>
                  <span className="text-[10px] uppercase tracking-[2px] text-gray-300 font-bold mt-1">mins</span>
                </div>
                <div className="flex flex-col items-center border-[1px] border-white/30 px-3 py-2 bg-black/40 backdrop-blur-md rounded-xl min-w-[75px] shadow-lg">
                  <span className="text-[26px] font-bold text-white leading-none font-montserratBold">{timeLeft.seconds}</span>
                  <span className="text-[10px] uppercase tracking-[2px] text-gray-300 font-bold mt-1">secs</span>
                </div>
              </div>

              <div className="flex gap-4 items-baseline mt-6">
                <p className="text-gray-300/60 line-through text-[22px] font-montserratBold">${originalPrice.toFixed(2)}</p>
                <div className='flex flex-col'>
                  <p className='text-[40px] md:text-[48px] font-montserratBold text-buttons leading-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]'>
                    ${discountedPrice}
                  </p>
                  <span className='text-[12px] text-buttons font-bold text-right'>Limited Time Offer</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/shop')}
                className="mt-8 bg-buttons text-white px-10 py-4 rounded-full font-montserratBold text-lg shadow-[0_10px_20px_rgba(102,0,238,0.3)] hover:shadow-[0_15px_30px_rgba(102,0,238,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 w-fit flex items-center gap-2 group/btn"
              >
                Get it Now
                <span className='group-hover/btn:translate-x-2 transition-transform duration-300'>→</span>
              </button>
            </div>
          </div>
        );
      })}
      
      {/* Navigation Indicators */}
      <div className="absolute bottom-8 right-8 flex gap-3 z-20">
        {discountedProducts.map((_, i) => (
          <button 
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === activeIndex 
                ? 'bg-buttons w-12 shadow-[0_0_10px_rgba(102,0,238,0.8)]' 
                : 'bg-white/40 w-2 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default News;
