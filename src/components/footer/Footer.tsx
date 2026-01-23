import {   Phone  } from 'lucide-react'
import {HiLocationMarker} from "react-icons/hi"
import { FaRegEnvelopeOpen} from 'react-icons/fa6';
import { FiFacebook } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { NavLink} from 'react-router-dom';
import logo from "../Images/ChatGPT Image Jan 23, 2026, 12_18_42 PM.png"

const Footer = () => {
     
  const navigate = useNavigate();



  const home = () => {
    navigate("/")
  }


  const shop = () => {
    navigate("/shop")
  }


  const blog = () => {
    navigate("/blog")
  }


  const contact = () => {
    navigate("/contact")
  }

  const about = () => {
    navigate("/about")
  }

 

  const faq = () => {
    navigate("/faq")
  }

  const whilelist = () => {
    navigate("/whilelist")
  }

  

  const categories = () => {
    navigate("/categories")
  }

  const blogarticle = () => {
    navigate("/blogarticle")
  }

  const services = () => {
    navigate("/services")
  }
  const account = () => {
    navigate("/account")
  }


  return (
    <div className= "flex flex-col justify-between items-center bg-navbar px-5 py-[50px] md:px-[40px] lg:px-[80px] xl:px-[100px]  md:py-[60px] lg:py-[60px] xl:py-[80px]">
      

<div className="flex w-full flex-wrap md:flex-nowrap  justify-between md:flex-row ">
    {/* First section - 25% */}
    <div className=" w-[45%] pb-8 md:pb-0 md:w-[23%]  flex flex-col">



 <NavLink to="/home">
     <img src={logo} className=' w-[30%] object-cover' alt="" />
 </NavLink>



        <p className='sm:text-sm md:text-[15px] lg:text-[16px] text-white font-montserrat text-[16px]'>
           Multimart is your trusted online store offering quality products for everyday needs, combining convenience, affordability, and a smooth shopping experience.
        </p>
    </div>
    
    {/* Remaining 75% divided into 3 equal parts (25% each) */}
    <div className="w-[45%] md:w-[23%]  flex flex-wrap flex-col  gap-2">
        
           
                <h3 className='font-montserratBold pb-2 md:pb-3 text-[18px] text-white'>Navigation</h3>
                <p className='font-montserrat cursor-pointer text-white text-sm md:text-[16px]' onClick={home} >Home</p>
                <p className='font-montserrat cursor-pointer text-white text-sm md:text-[16px]' onClick={about}>Aboutus</p>
                <p className='font-montserrat cursor-pointer text-white text-sm md:text-[16px]' onClick={shop}>Shop</p>
                <p className='font-montserrat cursor-pointer text-white text-sm md:text-[16px]' onClick={blog}>Blogs</p>
           
     
    </div>

    <div className="w-[45%] md:w-[23%]   flex flex-wrap flex-col  gap-2">
        
           
                <h3 className='font-montserratBold pb-2 md:pb-3 text-[18px] text-white'>Quick Link</h3>
                <p className='font-montserrat cursor-pointer text-white text-sm md:text-[16px]' onClick={contact}>Contact Us</p>
                <p className='font-montserrat cursor-pointer text-white text-sm md:text-[16px]' onClick={faq}>FAQS</p>
                <p className='font-montserrat cursor-pointer text-white text-sm md:text-[16px]' onClick={blogarticle}>Blogarticle </p>
                <p className='font-montserrat cursor-pointer text-white text-sm md:text-[16px]' onClick={account}>Account</p>
           
     
    </div>

    <div className="w-[45%] md:w-[23%]   flex flex-wrap flex-col gap-2">
        
           
                <h3 className='font-montserratBold pb-2 md:pb-3 text-[18px] text-white'>Services</h3>
                <p className='font-montserrat cursor-pointer text-white text-sm md:text-[16px]' onClick={home}>Home</p>
                <p className='font-montserrat cursor-pointer text-white text-sm md:text-[16px]' onClick={services}>Services</p>
                <p className='font-montserrat cursor-pointer text-white text-sm md:text-[16px]' onClick={whilelist}>Whilelist</p>
                <p className='font-montserrat cursor-pointer text-white text-sm md:text-[16px]' onClick={categories}>Categories</p>
    </div>
</div>
       


{/* Second section stays the same but with equal spacing */}
<div className="flex w-full flex-wrap md:flex-nowrap  md:flex-row justify-between  pt-6">
   
       
            <div className="flex pt-3 pb-6 md:pb-0   w-[45%] md:w-[23%] items-center gap-2">
                <HiLocationMarker className='h-[25px] w-[25px] text-white font-montserrat'/>
                <p className='font-montserrat text-white text-sm md:text-sm lg:text-[16px]'>Zimbabwe Harare</p>
            </div>

            <div className="flex pt-3 pb-6 md:pb-0  w-[45%] md:w-[23%] items-center gap-2">
                <Phone className='h-[25px] w-[25px] text-white font-montserrat'/>
                <p className='font-montserrat text-white text-sm md:text-sm lg:text-[16px]'>+263-775306263</p>
            </div>

            <div className="flex  w-[45%] md:w-[23%] items-center gap-2">
                <FaRegEnvelopeOpen className='h-[25px] w-[25px] text-white font-montserrat'/>
                <p className='font-montserrat text-white text-sm md:text-sm lg:text-[16px]'>omultimart@gmail.com</p>
            </div>
      
  

    <div className=" w-[45%] md:w-[23%]  flex items-center justify-end gap-11">
        
            <div  className="flex gap-5">
                <FiFacebook className='w-[25px] h-[25px] text-white font-montserrat'/>
                <FaInstagram className='w-[25px] h-[25px] text-white font-montserrat'/>
                <FaXTwitter className='w-[25px] h-[25px] text-white font-montserrat'/>
            </div>
     
    </div>
</div>


        <div className='w-full mt-8 border'><span></span></div>
         
         <p className='text-sm text-white pt-3 md:pt-4 lg:pt-5 xl:pt-6 md:text-[16px] lg:text-[16px] font-montserrat '>@2026 Multimart Online Shop. All Rights Reserved </p>
    </div>
  )
}

export default Footer