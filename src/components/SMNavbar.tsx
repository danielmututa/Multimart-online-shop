



import React, { useState } from 'react';
import { ChevronDown, Search, ShoppingCart, User } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from './shop/CartContext';

const MobileNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const { cart } = useCart(); // Use 'cart' from context

  const toggleAccordion = (item: string) => {
    setOpenAccordion(openAccordion === item ? null : item);
  };

  return (
    <nav className="lg:hidden fixed w-full bg-navbar shadow-md z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center h-16">
          <p className="text-white font-montserratBold text-xl">Dimbo P</p>
          
          {/* Mobile Menu Button */}
          <button
            className="focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col space-y-1.5">
              <span className={`h-0.5 w-full bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`h-0.5 w-full bg-white transition-all ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`h-0.5 w-full bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className={`bg-navbar h-screen transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
          <div className="px-4 py-4 space-y-4">
            {/* Home Link */}
            <NavLink 
              to="/home" 
              className="block text-white font-montserrat py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>

            {/* Pages Accordion */}
            <div className="border-b border-gray-700 pb-2">
              <button 
                className="flex justify-between items-center w-full text-white font-montserrat py-2"
                onClick={() => toggleAccordion('pages')}
              >
                <span>Pages</span>
                <ChevronDown size={16} className={`transition-transform ${openAccordion === 'pages' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openAccordion === 'pages' ? 'max-h-96' : 'max-h-0'}`}>
                <div className="pl-4 pt-2 space-y-3">
                  <Link to="/about" className="block text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>About us</Link>
                  <Link to="/team" className="block text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>About Team</Link>
                  <Link to="/services" className="block text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Services</Link>
                  <Link to="/contact" className="block text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Contact us</Link>
                  <Link to="/faq" className="block text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>FAQ</Link>
                  <Link to="/whilelist" className="block text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
                  <Link to="/login" className="block text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Login</Link>
                </div>
              </div>
            </div>

            {/* Shop Accordion */}
            <div className="border-b border-gray-700 pb-2">
              <button 
                className="flex justify-between items-center w-full text-white font-montserrat py-2"
                onClick={() => toggleAccordion('shop')}
              >
                <span>Shop</span>
                <ChevronDown size={16} className={`transition-transform ${openAccordion === 'shop' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openAccordion === 'shop' ? 'max-h-96' : 'max-h-0'}`}>
                <div className="pl-4 pt-2 space-y-3">
                  <Link to="/shop" className="block text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Product Listings</Link>
                  <Link to="/categories" className="block text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Categories</Link>
                  <Link to="/account" className="block text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Account</Link>
                </div>
              </div>
            </div>

            {/* Blogs Accordion */}
            <div className="border-b border-gray-700 pb-2">
              <button 
                className="flex justify-between items-center w-full text-white font-montserrat py-2"
                onClick={() => toggleAccordion('blogs')}
              >
                <span>Blogs</span>
                <ChevronDown size={16} className={`transition-transform ${openAccordion === 'blogs' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openAccordion === 'blogs' ? 'max-h-96' : 'max-h-0'}`}>
                <div className="pl-4 pt-2 space-y-3">
                  <Link to="/blog" className="block text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Blog</Link>
                  <Link to="/blogarticle" className="block text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>Blog Article</Link>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-8">
        <Link to="/search">
        
        <Search  size={18} className='text-white hover:text-buttons font-extrabold'/>
        </Link>
        </div>

            {/* Icons Row */}
            <div className="flex justify-start space-x-6 pt-4">
              <Search size={18} className="text-white" />
              <User size={18} className="text-white" />
              <Link to="/cart" className='relative' onClick={() => setIsMenuOpen(false)}>
                <ShoppingCart size={18} className="text-white" />
                <span className="text-white absolute top-0 right-[-6px] text-[8px] font-montserrat">{cart?.length ?? 0}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MobileNavbar;
