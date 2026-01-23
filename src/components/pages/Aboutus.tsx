



import React from 'react';
import banner from "../Images/Aboutusu.jpg";
import About from './About';

const Aboutus: React.FC = () => {
  return (
    <div className="">
      <div className='relative h-[400px] md:h-[350px] lg:h-[450px] xl:h-[75vh]'>
        <img 
          loading='lazy' 
          src={banner} 
          className='w-full h-full object-cover' 
          alt="About us banner" 
        />
        <div className="w-full h-full bg-blue-600/40 absolute flex top-0 justify-center items-center">
          <h2 className='text-[20px] md:text-[23px] lg:text-[26px] text-white font-montserratBold'>
            About Us
          </h2>
        </div>
      </div>
      <About />
    </div>
  );
};

export default Aboutus;