



import React from 'react';
import online from "../Images/collection-summer.jpg";
import newspring from "../Images/newspring things.jpg";
import springsell from "../Images/collection summer.jpg";
import summercollecton from "../Images/summer-collection.jpg";
import selle from "../Images/sell-product.jpg";

const Topsellingproducts: React.FC = () => {
  return (
    <div className='flex justify-center items-center flex-col px-[20px] py-[50px] md:px-[40px] md:py-[60px] md:flex-col lg:py-[60px] lg:px-[80px] lg:flex-col xl:py-20 xl:px-[100px] xl:flex-col'>
      <h2 className='text-[20px] pb-2 md:text-[23px] md:pb-3 font-montserratBold lg:text-[26px] lg:pb-3 xl:text-[36px] xl:pb-3'>Top Selling Smartphones</h2>
      <p className='text-sm pb-4 text-center md:text-[16px] md:pb-[25px] lg:text-lg xl:text-lg text-gray-500 lg:pb-[30px] xl:pb-[36px]'>
        Explore a wide range of modern products designed to enhance your everyday life. Each item blends innovation, stylish design, and reliable performance to keep you connected, comfortable, and productive—no matter your lifestyle.
      </p>

      <div className="flex flex-col lg:flex lg:justify-between lg:flex-row xl:flex-row">
        <div className="w-full h-[350px] lg:w-[49%] lg:h-[440px] xl:h-[440px] relative overflow-hidden group">
          <img loading='lazy' src={newspring} className='w-full h-full object-cover group-hover:scale-110 transform transition-all duration-500' alt="New spring collection" />

          <div className="pt-12 pl-5 absolute top-0 lg:pt-12 lg:pl-10 left-0 flex flex-col w-full gap-2 h-full">
            <h4 className='text-[16px] font-montserratBold text-white lg:text-[16px]'>Fresh Finds for Tech Enthusiasts!</h4>
            <h2 className='text-[20px] flex md:text-[23px] lg:text-[26px] font-montserratBold text-white group-hover:text-buttons duration-500'>Upgrade with top gadgets.</h2>
            <p className='text-white text-[14px] font-montserrat'>Save and stay ahead!</p>
          </div>
        </div>

        <div className="w-full h-[440px] pt-4 md:pt-5 md:gap-2 lg:w-[49%] lg:h-[440px] lg:pt-0 lg:gap-4 xl:pt-0 flex justify-between flex-wrap">
          <div className="w-[47.5%] mb-3 md:w-[48.2%] lg:mb-0 lg:w-[48%] xl:w-[48%] xl:mb-0 h-[48%] overflow-hidden relative group">
            <img loading='lazy' src={online} className='w-full h-full object-cover group-hover:scale-110 duration-500' alt="Online exclusive" />

            <div className="absolute top-0 right-0 pr-2 pt-6 h-full w-full flex flex-col gap-2 items-end"> 
              <h4 className='text-white text-[16px] font-montserratBold'>Online Exclusive</h4>
              <p className='text-white font-montserrat text-[14px] group-hover:text-buttons duration-500 underline'>Shop now!</p>
            </div>
          </div>

          <div className="w-[47.5%] lg:w-[48%] md:w-[48.2%] xl:w-[48%] h-[48%] overflow-hidden relative group">
            <img loading='lazy' src={springsell} className='w-full h-full object-cover group-hover:scale-110 duration-500' alt="Spring sale" />
            <div className="absolute top-0 w-full h-full">
              <h4 className="text-[16px] text-buttons bg-white px-2 py-3 right-0 bottom-0 mb-6 absolute font-montserratBold group-hover:bg-buttons duration-500 group-hover:text-white">Hot Deals!</h4>
            </div>
          </div>
          
          <div className="w-[47.5%] md:w-[48.2%] lg:w-[48%] xl:w-[48%] h-[48%] overflow-hidden relative group">
            <img loading='lazy' src={selle} className='w-full h-full object-cover group-hover:scale-110 duration-500' alt="Sale product" />
            <h4 className="text-[16px] bg-white px-2 py-3 text-buttons right-0 bottom-0 mb-6 absolute font-montserratBold group-hover:bg-buttons duration-500 group-hover:text-white">70% SALE</h4>
          </div>

          <div className="w-[47.5%] md:w-[48.2%] lg:w-[48%] xl:w-[48%] h-[48%] overflow-hidden relative group">
            <img loading='lazy' src={summercollecton} className='w-full h-full object-cover group-hover:scale-110 duration-500' alt="Summer collection" />

            <div className="absolute w-full h-full flex justify-center top-0">
              <div className="bg-buttons w-1 p-1"><span></span></div>
              <h4 className='text-white font-montserratBold pt-6 text-[16px] group-hover:text-buttons duration-500'>Smartphones Beyond!</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topsellingproducts;