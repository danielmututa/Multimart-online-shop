import React from 'react';

// ✅ Static imports for images
import Repair from '../Images/Card-LOGO.jpg';
import Salea from '../Images/vendor management.jpg';
import Recycling from '../Images/product verification.jpg';
import Customization from '../Images/personalized shopping.jpg';
import Software from '../Images/ordertracking.jpg';
import Suport from '../Images/Suport.jpg';

interface ServiceCard {
  img: string;
  type: string;
  des: string;
}

const Servicesec: React.FC = () => {
  // ✅ Use imported images directly
  const service: ServiceCard[] = [
    {
      img: Repair,
      type: "Secure Payments",
      des: "Shop with confidence using our secure payment gateway. We support multiple payment methods and ensure all transactions are encrypted and protected for your safety."
    },
    {
      img: Salea,
      type: "Vendor Management",
      des: "Seamlessly list and manage your products on our platform. Our vendor dashboard provides tools for inventory tracking, order management, and sales analytics."
    },
    {
      img: Recycling,
      type: "Product Verification",
      des: "We ensure quality by verifying vendors and their products. Our review system helps maintain trust and authenticity across the marketplace."
    },
    {
      img: Customization,
      type: "Personalized Shopping",
      des: "Discover products tailored to your preferences. Our smart recommendation system suggests items based on your browsing history and interests."
    },
    {
      img: Software,
      type: "Order Tracking",
      des: "Stay updated on your purchases with real-time order tracking. Monitor your shipment from vendor dispatch to doorstep delivery with ease."
    },
    {
      img: Suport,
      type: "Customer Support",
      des: "Get assistance whenever you need it. Our dedicated support team is available to help with orders, returns, vendor queries, and any marketplace concerns."
    }
  ];

  return (
    <div className='px-[20px] py-[50px] md:py-[60px] lg:py-[60px] md:px-[40px] lg:px-[60px] xl:px-[100px] xl:py-[80px]'>
      <div className="flex justify-between flex-wrap gap-7 md:gap-6 lg:gap-8 xl:gap-12 items-start">
        {service.map((card, index) => (
          <div key={index} className="flex w-full md:w-[48%] lg:w-[30%] items-center justify-center gap-3 flex-col">
            <div className="w-full h-[230px] relative">
              <img 
                loading='lazy' 
                className='object-cover w-full h-full' 
                src={card.img} 
                alt={card.type} 
              />
              <div className="absolute top-0 flex items-end pb-8 h-full w-full">
                <div className="p-3 bg-white">
                  <p className='font-montserratBold text-buttons'>{card.type}</p>
                </div>
              </div>
            </div>
            <p className='font-montserrat text-sm md:text-[16px]'>{card.des}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Servicesec;