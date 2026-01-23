import React from 'react';
import banner from "../Images/Services.jpg";
import Servicesec from './Servicesec';

const Services: React.FC = () => {
  return (
    <div className=''>
        <div className="h-[400px] md:h-[400px] lg:h-[400px] relative xl:h-[75vh] w-full">
            <img 
                src={banner} 
                className='h-full w-full object-cover' 
                alt="Our services banner" 
            />
            <div className="w-full h-full top-0 bg-blue-600/40 absolute flex items-center justify-center flex-col text-center px-[20px] md:px-[40px] lg:px-[60px] xl:px-[100px] gap-2">
               <h2 className='text-white font-montserratBold text-[20px] md:text-[23px] lg:text-[26px]'>
                    Our Services
               </h2>
               <p className='text-sm md:text-[16px] lg:text-[18px] text-white font-montserrat'>
                    At MultiMart Online Shop, we provide a comprehensive marketplace platform that connects shoppers 
                    with diverse vendors. Whether you're browsing for electronics, fashion, home goods, or any other 
                    products, our platform offers secure transactions, reliable vendor verification, and exceptional 
                    customer support to ensure a seamless shopping experience.
               </p>
            </div>
        </div>

        <Servicesec />
    </div>
  );
};

export default Services;