import React from 'react';
import abt1 from "../Images/abt.jpg";
import abt2 from "../Images/abtus.jpg";
import abt3 from "../Images/abotmeet.jpg";

interface CardItem {
  number: string;
  type: string;
  des: string;
}

const About: React.FC = () => {
  const cards: CardItem[] = [
    {
      number: "1",
      type: "Our Vision", 
      des: "To be the leading online marketplace that connects buyers and sellers seamlessly, creating a trusted platform where vendors can showcase their products and customers discover quality items from various shops, all in one convenient location."
    },
    {
      number: "2",
      type: "Our Mission", 
      des: "At MultiMart Online Shop, our mission is to empower vendors by providing a reliable platform to list and sell their products, while offering customers a diverse shopping experience. We strive to make online commerce accessible, secure, and convenient for everyone in our marketplace community."
    },
    {
      number: "3",
      type: "Our Values", 
      des: "At MultiMart, we are driven by core values: fostering trust between buyers and sellers, prioritizing customer satisfaction, ensuring platform security, promoting fair trade practices, and striving for excellence in service delivery. These values guide us in everything we do."
    }
  ];

  return (
    <div className='py-[50px] px-[20px] md:py-[50px] md:px-[40px] lg:px-[60px] lg:py-[60px] xl:py-[80px] flex flex-col xl:px-[100px]'>
      <div className="flex-col md:flex-row lg:flex-row flex justify-between">
        <div className="flex-col flex w-full md:w-[46%] lg:w-[46%] gap-4">
          <div className="flex justify-between">
            <img loading='lazy' src={abt1} className='w-[48%] h-[200px] object-cover' alt="MultiMart marketplace" />
            <img loading='lazy' src={abt2} className='w-[48%] h-[200px] object-cover' alt="Online shopping" />
          </div>
          <img loading='lazy' src={abt3} className='object-cover h-[250px]' alt="Our community" />
        </div>
     
        <div className="flex justify-center flex-col w-full md:w-[46%] lg:w-[46%]">
          <h4 className="text-sm md:text-sm lg:text-[16px] text-buttons py-2 font-montserrat">WHO ARE WE?</h4>
          <h2 className='text-[20px] md:text-[23px] xl:text-[26px] font-montserratBold'>Your Trusted Online Marketplace for All Products</h2>
          <p className='text-sm md:text-[16px] xl:text-[18px] font-montserrat py-2'>
            At MultiMart Online Shop, we believe in connecting shoppers with 
            quality products from various vendors. Our platform enables shops 
            and sellers to list their products, reaching customers across 
            the region. Whether you're looking for electronics, fashion, home 
            goods, or any other items, you'll find everything you need in one 
            convenient marketplace. We're committed to providing a secure, 
            reliable, and user-friendly shopping experience for everyone.
          </p>
        </div>
      </div>
       
      <div className="flex flex-col lg:flex-row justify-between pt-10">
        {cards.map((card, index) => (
          <div key={index} className="w-full pb-[25px] lg:pb-0 lg:w-[30%] flex justify-between gap-2">
            <div className="h-9 w-9 flex justify-center items-center rounded-full bg-white shadow-sm text-buttons font-montserratBold border">
              {card.number}
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-montserratBold text-[16px]">{card.type}</h4>
              <p className='text-[15px]'>{card.des}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;