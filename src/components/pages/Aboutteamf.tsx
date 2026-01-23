import React from 'react';

// ✅ Static image imports
import CEO from '../Images/liberty.jpg';
import COM from '../Images/Me.jpg';

interface TeamMember {
  img: string;
  name: string;
  position: string;
  des: string;
}

const Aboutteamf: React.FC = () => {
  const cardteam: TeamMember[] = [
    {
      img: CEO,
      name: "Liberty Chiparah",
      position: "Project Leader",
      des: "Leads the MultiMart platform vision and strategy, ensuring seamless marketplace operations and driving growth for vendors and customers alike."
    },
    {
      img: COM,
      name: "Daniel Mututa",
      position: "Developer",
      des: "Develops and maintains the platform's core features, ensuring a smooth, reliable, and user-friendly experience for all marketplace users."
    },
  ];

  return (
    <div className='px-[20px] py-[50px] md:px-[40px] md:py-[60px] lg:px-[80px] lg:py-[60px] xl:px-[100px] xl:py-[80px]'>
      <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12">
        {cardteam.map((card, index) => (
          <div key={index} className="w-full md:w-[340px] lg:w-[360px] flex flex-col items-center text-center">
            <img 
              loading='lazy' 
              className='object-cover w-full h-[280px]' 
              src={card.img} 
              alt={`${card.name}, ${card.position}`} 
            />
            <p className='font-montserratBold md:text-[16px] pt-[14px]'>{card.name}</p>
            <p className='font-montserrat text-buttons md:text-[16px]'>{card.position}</p>
            <p className='font-montserrat text-gray-500 text-sm md:text-[16px]'>{card.des}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Aboutteamf;