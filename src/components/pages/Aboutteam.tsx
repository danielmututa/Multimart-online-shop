import React from 'react';
import team from "../Images/team.jpg";
import Aboutteamf from './Aboutteamf';

const Aboutteam: React.FC = () => {
  return (
    <div className="">
      <div className='h-[400px] md:h-[450px] lg:h-[450px] xl:h-[80vh] relative'>
        <img 
          loading='lazy' 
          src={team} 
          className='h-full object-cover w-full' 
          alt="Our team working together" 
        />
        <div className="flex bg-blue-600/40 top-0 absolute h-full w-full justify-center items-center flex-col gap-2 px-[20px] md:px-[40px] lg:px-[60px] xl:px-[100px] text-center">
          <h2 className='text-[20px] md:text-[23px] xl:text-[26px] text-white font-montserratBold'>
            Our Team
          </h2>
          <p className='text-sm md:text-[16px] xl:text-[18px] font-montserrat text-white'>
            At MultiMart Online Shop, our dedicated team is passionate about creating the best marketplace experience. 
            From platform developers to customer support specialists, we work together to connect vendors and shoppers, 
            ensuring a seamless shopping experience and empowering businesses to grow in the digital marketplace.
          </p>
        </div>
      </div>

      <Aboutteamf />    
    </div>
  );
};

export default Aboutteam;