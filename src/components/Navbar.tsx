import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, ShoppingCart } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import Account from '@/Account/Account';
import { useCart } from './shop/CartContext';
import logo from "./Images/ChatGPT Image Jan 23, 2026, 12_18_42 PM.png"  // Import useCart

const Navbar = () => {
  const { cart } = useCart(); // Corrected from cartItems
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuItemClick = () => setOpenMenu(null);

  return (
    <div className="hidden lg:flex fixed w-full z-50 justify-between items-center bg-navbar shadow-md py-[18px] px-[100px]">
      {/* <p className="text-white font-montserratBold text-xl">Dimbo P</p> */}
      {/* <p className="text-white font-montserratBold text-xl">Dimbo P</p> */}

 <NavLink to="/home">
     <img src={logo} className=' w-[9%] object-cover' alt="" />
 </NavLink>

      <div className="flex justify-between items-center gap-9" ref={dropdownRef}>
        {/* <NavLink to="/home" className="text-white font-montserrat hover:font-montserratBold">
          Home
        </NavLink> */}

        {/* Pages dropdown */}
        <div className="relative" onMouseEnter={() => setOpenMenu('pages')}>
          <button className="flex gap-1 items-center font-montserrat text-white hover:font-montserratBold">
            Pages
            <ChevronDown size={14} className={`text-white transition-transform duration-300 ${openMenu === 'pages' ? 'rotate-180' : ''}`} />
          </button>
          <div className={`absolute left-0 mt-[18px] flex-col w-48 bg-white border rounded shadow-lg z-10 transition-all duration-300 origin-top ${openMenu === 'pages' ? 'opacity-100 transform scale-y-100' : 'opacity-0 transform scale-y-0'}`}>
            <div className="w-full flex flex-col">
              <Link to="/about" className="px-4 py-4 hover:bg-buttons font-montserrat cursor-pointer" onClick={handleMenuItemClick}>About us</Link>
              <Link to="/team" className="px-4 py-4 hover:bg-buttons font-montserrat cursor-pointer" onClick={handleMenuItemClick}>About Team</Link>
              <Link to="/services" className="px-4 py-4 hover:bg-buttons font-montserrat cursor-pointer" onClick={handleMenuItemClick}>Services</Link>
              <Link to="/contact" className="px-4 py-4 hover:bg-buttons font-montserrat cursor-pointer" onClick={handleMenuItemClick}>Contact us</Link>
              <Link to="/faq" className="px-4 py-4 hover:bg-buttons font-montserrat cursor-pointer" onClick={handleMenuItemClick}>FAQ</Link>
              <Link to="/whilelist" className="px-4 py-4 hover:bg-buttons font-montserrat cursor-pointer" onClick={handleMenuItemClick}>Wishlist</Link>
              <Link to="/login" className="px-4 py-4 hover:bg-buttons font-montserrat cursor-pointer" onClick={handleMenuItemClick}>Login</Link>
            </div>
          </div>
        </div>

        {/* Shop dropdown */}
        <div className="relative" onMouseEnter={() => setOpenMenu('shop')}>
          <button className="flex gap-1 items-center font-montserrat text-white hover:font-montserratBold">
            Shop
            <ChevronDown size={14} className={`text-white transition-transform duration-300 ${openMenu === 'shop' ? 'rotate-180' : ''}`} />
          </button>
          <div className={`absolute left-0 mt-[18px] w-48 bg-white border rounded shadow-lg z-10 transition-all duration-300 origin-top ${openMenu === 'shop' ? 'opacity-100 transform scale-y-100' : 'opacity-0 transform scale-y-0'}`}>
            <div className="w-full flex flex-col">
              <Link to="/shop" className="px-4 py-4 hover:bg-buttons font-montserrat cursor-pointer" onClick={handleMenuItemClick}>Product Listings</Link>
              <Link to="/categories" className="px-4 py-4 hover:bg-buttons font-montserrat cursor-pointer" onClick={handleMenuItemClick}>Categories</Link>
              <Link to="/account" className="px-4 py-4 hover:bg-buttons font-montserrat cursor-pointer" onClick={handleMenuItemClick}>Account</Link>
            </div>
          </div>
        </div>

        {/* Blogs dropdown */}
        <div className="relative" onMouseEnter={() => setOpenMenu('blogs')}>
          <button className="flex gap-1 items-center text-white font-montserrat hover:font-montserratBold">
            Blogs
            <ChevronDown size={14} className={`text-white transition-transform duration-300 ${openMenu === 'blogs' ? 'rotate-180' : ''}`} />
          </button>
          <div className={`absolute left-0 mt-[18px] w-48 bg-white border rounded shadow-lg z-10 transition-all duration-300 origin-top ${openMenu === 'blogs' ? 'opacity-100 transform scale-y-100' : 'opacity-0 transform scale-y-0'}`}>
            <div className="w-full flex flex-col">
              <Link to="/blog" className="px-4 py-4 hover:bg-buttons font-montserrat cursor-pointer" onClick={handleMenuItemClick}>Blog</Link>
              <Link to="/blogarticle" className="px-4 py-4 hover:bg-buttons font-montserrat cursor-pointer" onClick={handleMenuItemClick}>Blog Article</Link>
            </div>
          </div>
        </div>


      {/* Icons */}
      <div className="flex justify-between   items-center gap-8">
        <Link to="/search">
        
        <Search  size={18} className='text-white hover:text-buttons font-extrabold'/>
        </Link>


        <Account />
        {/* <User size={18} className='text-white hover:text-buttons font-extrabold'/> */}
        <Link to="/cart" className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-white hover:text-buttons font-extrabold" />
          <span className="text-white text-sm font-montserrat">{cart?.length ?? 0}</span> {/* Safe access */}
        </Link>
      </div>

      </div>

    </div>
  );
};

export default Navbar;
