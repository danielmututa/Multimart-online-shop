import { Headphones, RefreshCw, Truck } from 'lucide-react';
import React from 'react';

const Fastdelivary: React.FC = () => {
  return (
    <div className=''>
      <div className=" w-full border bg-buttons "><span></span></div>

      <div className="px-[20px] flex flex-col md:px-[40px] md:flex-row lg:px-[60px] lg:flex-row relative xl:px-[100px] xl:flex-row md:justify-between lg:justify-evenly xl:justify-evenly py-8 ">
        <div className="flex flex-col justify-center xl:flex-row pb-20 pt-[60px] md:py-0 lg:py-0 xl:py-0 gap-2 items-center"> 
          <Truck className="w-[50px] h-[50px] md:w-[35px] md:h-[35px] lg:h-[50px] lg:w-[50px]"/> 
          <div className="flex flex-col items-center justify-center xl:items-start xl:justify-start gap-1">
            <h3 className="text-buttons font-montserratBold text-[18px] md:text-[18px] lg:text-[20px]"> Fast & Free Delivery</h3>
            <p>On orders over $50</p>
          </div>
        </div>

        <div className="border sm:w-full md:h-[200px] md:w-[1px] lg:h-[200px] lg:w-[1px] xl:h-[200px] xl:w-[1px] bg-buttons"><span></span></div>

        <div className="flex flex-col justify-center xl:flex-row py-20 md:py-0 lg:py-0 xl:py-0 gap-2 items-center"> 
          <Headphones className="w-[50px] h-[50px] md:w-[35px] md:h-[35px] lg:h-[50px] lg:w-[50px]"/>
          <div className="flex flex-col items-center justify-center xl:items-start xl:justify-start gap-1">
            <h3 className="text-buttons font-montserratBold text-[18px] md:text-[18px] lg:text-[20px]"> Expert Support, Anytime</h3>
            <p>24/7 assistance for all your queries</p>
          </div>
        </div>

        <div className="border sm:w-full md:h-[200px] md:w-[1px] lg:h-[200px] lg:w-[1px] xl:h-[200px] xl:w-[1px] bg-buttons"><span></span></div>

        <div className="flex flex-col justify-center xl:flex-row pt-20 pb-[60px] md:py-0 lg:py-0 xl:py-0 gap-2 items-center"> 
          <RefreshCw className="w-[50px] h-[50px] md:w-[35px] md:h-[35px] lg:h-[50px] lg:w-[50px]"/>
          <div className="flex flex-col items-center justify-center xl:items-start xl:justify-start gap-1">
            <h3 className="text-buttons font-montserratBold text-[18px] md:text-[18px] lg:text-[20px]"> Hassle-Free Returns</h3>
            <p>30-day money-back guarantee </p>
          </div>
        </div>
      </div>

      <div className=" w-full border bg-buttons "><span></span></div>
    </div>
  );
};

export default Fastdelivary;