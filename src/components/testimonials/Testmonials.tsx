import { QuoteIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'

// ✅ Import images
import sophiaImg from '../Images/Sophia Lee.jpg'
import michaelImg from '../Images/Michael Roberts.jpg'
import emilyImg from '../Images/Emily Chen.jpg'
import jamesImg from '../Images/James Wright.jpg'
import aishaImg from '../Images/Aisha Khan.jpg'
import davidImg from '../Images/David Smith.jpg'
import mariaImg from '../Images/Maria Gonzalez.jpg'

// ✅ Map images by filename
const testimonialImages: Record<string, string> = {
  'sophia-lee.jpg': sophiaImg,
  'michael-roberts.jpg': michaelImg,
  'emily-chen.jpg': emilyImg,
  'james-wright.jpg': jamesImg,
  'aisha-khan.jpg': aishaImg,
  'david-smith.jpg': davidImg,
  'maria-gonzalez.jpg': mariaImg,
}

interface Testimonial {
  icon: typeof QuoteIcon
  img: string
  name: string
  role: string
  Comment: string
}

const Testimonials: React.FC = () => {
  const [position, setPosition] = useState<number>(0)

  const testimonials: Testimonial[] = [
     {
    icon: QuoteIcon,
    img: 'sophia-lee.jpg',
    name: 'Sophia Lee',
    role: 'Seller',
    Comment: 'Uploading my products to this shop was so easy! The interface is simple, and I reached customers faster than I expected.'
  },
  {
    icon: QuoteIcon,
    img: 'michael-roberts.jpg',
    name: 'Michael Roberts',
    role: 'Buyer',
    Comment: 'I bought a refurbished laptop and it works perfectly! Great value for the price and very reliable.'
  },
  {
    icon: QuoteIcon,
    img: 'emily-chen.jpg',
    name: 'Emily Chen',
    role: 'Seller',
    Comment: 'Listing my gadgets was straightforward. The shop gives sellers a good chance to showcase their products professionally.'
  },
  {
    icon: QuoteIcon,
    img: 'james-wright.jpg',
    name: 'James Wright',
    role: 'Buyer',
    Comment: 'I got my new headphones here and they arrived quickly. Excellent quality and service. Very satisfied!'
  },
  {
    icon: QuoteIcon,
    img: 'aisha-khan.jpg',
    name: 'Aisha Khan',
    role: 'Seller',
    Comment: 'Selling refurbished devices here has been amazing. The shop connects me to real buyers and handles everything smoothly.'
  },
  {
    icon: QuoteIcon,
    img: 'david-smith.jpg',
    name: 'David Smith',
    role: 'Buyer',
    Comment: 'I purchased a camera accessory and it works flawlessly. The shop makes buying tech easy and trustworthy.'
  },
  {
    icon: QuoteIcon,
    img: 'maria-gonzalez.jpg',
    name: 'Maria Gonzalez',
    role: 'Buyer',
    Comment: 'The smart home device I ordered is easy to use and arrived on time. Shopping here is so convenient!'
  },
  ]

  const duplicatedTestimonials = [...testimonials, ...testimonials]

  useEffect(() => {
    const animation = setInterval(() => {
      setPosition((prev) => (prev >= testimonials.length * 35 ? 0 : prev + 0.5))
    }, 100)

    return () => clearInterval(animation)
  }, [testimonials.length])

  return (
    <div className='pt-[50px] md:pt-[60px] xl:pt-[80px]  pb-[50px] md:pb-[60px] xl:pb-[80px]'>
      <div className="relative overflow-hidden w-full">
        <div
          className="flex gap-14 transition-transform duration-300 ease-linear"
          style={{ transform: `translateX(-${position}%)` }}
        >
          {duplicatedTestimonials.map((card, index) => (
            <div
              key={index}
              className="relative w-full md:w-[35%] flex-shrink-0 flex flex-col gap-7"
            >
              <p className='text-sm md:text-[16px] font-montserrat pt-10'>{card.Comment}</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonialImages[card.img]}
                  className='h-12 w-12 rounded-full object-cover'
                  alt={card.name}
                />
                <div className="flex flex-col">
                  <h4 className='font-montserratBold text-buttons'>{card.name}</h4>
                  <p className='text-sm md:text-[16px] font-montserrat text'>{card.role}</p>
                </div>
              </div>
              <card.icon size={30} className='text-buttons absolute top-[-5]' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Testimonials
