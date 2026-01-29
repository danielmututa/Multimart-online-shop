import React, { useState } from 'react';
import contactone from "../Images/contactpage.jpg";
import { PhoneIcon } from 'lucide-react';
import map from "../Images/map.jpg";
import { HiOutlineMailOpen } from "react-icons/hi";
import { FaInstagram } from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";
import { FiFacebook } from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";
import emailjs from '@emailjs/browser';

interface ContactItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  type: string;
  content: string;
}

interface MediaItem {
  media: React.ComponentType<{ size?: number; className?: string }>;
}

const Contactpage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const contact: ContactItem[] = [
    {
      icon: PhoneIcon,
      type: "Phone",
      content: "+263-775306263 / +263-775 685 957 "
    },
    {
      icon: HiOutlineMailOpen,
      type: "Email",
      content: "omultimart@gmail.com"
    },
    {
      icon: HiLocationMarker,
      type: "Address",
      content: "Zimbabwe Harare"
    }
  ];

  const media: MediaItem[] = [
    { media: FiFacebook },
    { media: FaInstagram },
    { media: FaXTwitter },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    // EmailJS configuration - ALL CREDENTIALS ARE CORRECT! ✅
    const SERVICE_ID = 'service_ot3zwcu';           // ✅ Your Service ID
    const TEMPLATE_ID = 'template_692l6gq';         // ✅ Your Template ID
    const PUBLIC_KEY = 'QD_1OCuUhJSw8TEeH';         // ✅ Your Public Key

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      phone: formData.phone,
      message: formData.message,
      to_email: 'omultimart@gmail.com'
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then((response) => {
        console.log('SUCCESS!', response.status, response.text);
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
        
        // Clear success message after 5 seconds
        setTimeout(() => setStatus(''), 5000);
      })
      .catch((error) => {
        console.error('FAILED...', error);
        setStatus('error');
        
        // Clear error message after 5 seconds
        setTimeout(() => setStatus(''), 5000);
      });
  };

  return (
    <div className=''>
      <div className='h-[400px] md:h-[400px] lg:h-[400px] xl:h-[80vh] relative'>
        <img loading='lazy' src={contactone} className='h-full object-cover w-full' alt="Contact us banner" />
        <div className="flex bg-blue-600/40 top-0 absolute h-full w-full justify-center items-center flex-col gap-1 md:gap-2 px-[20px] md:px-[40px] lg:px-[60px] xl:px-[100px] text-center">
          <h2 className='text-[20px] md:text-[23px] lg:text-[26px] text-white font-montserratBold'>Contact us</h2>
          <p className='text-sm md:text-[16px] lg:text-[18px] font-montserrat text-white'>
            At MultiMart Online Shop, we're here to help! Whether you're a shopper with questions about orders, 
            or a vendor looking to join our marketplace, our dedicated support team is ready to assist you. 
            Reach out to us and experience exceptional customer service.
          </p>
        </div>
      </div>

      <div className="px-[20px] py-[50px] md:py-[60px] md:px-[40px] lg:px-[60px] xl:px-[100px] flex flex-col md:flex-row justify-between xl:py-[80px]">
        {/* Get In Touch */}
        <div className="flex w-full md:w-[46%] flex-col gap-10">
          <div className="flex flex-col">
            <h2 className='text-[20px] md:text-[23px] lg:text-[26px] font-montserratBold pb-1'>Get In Touch</h2>
            <p className='text-sm text-[16px] lg:text-[18px] font-montserrat'>
              Have questions about products, orders, or want to become a vendor? We'd love to hear from you. 
              Contact us through any of the channels below.
            </p>
          </div>

          <div className="flex w-full flex-wrap justify-between gap-8 lg:gap-12">
            {contact.map((card, index) => (
              <div key={index} className="flex gap-2 md:gap-3">
                <div className="bg-white w-10 h-10 md:h-11 md:w-11 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-md">
                  <card.icon size={25} className='text-buttons'/>
                </div>

                <div className="flex flex-col">
                  <h4 className='font-montserratBold text-[16px]'>{card.type}</h4>
                  <p className='text-[12px] lg:text-[16px] font-montserrat'>{card.content}</p>
                </div>
              </div>
            ))}

            {/* line */}
            <div className="w-1/2 bg-buttons p-[1px]"><span></span></div>
          </div>

          {/* Social media */}
          <div className="flex gap-12">
            <h4 className='font-montserratBold text-[16px]'>Social Media</h4>

            {/* media icons */}
            <div className="flex gap-4">
              {media.map((card, index) => (
                <div key={index}>
                  <card.media className='text-buttons font-montserratBold' size={20} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="w-full mt-8 lg:mt-0 lg:w-[46%] md:p-4">
          <form className='w-full flex flex-col gap-5' onSubmit={handleSubmit}>
            {/* Status Messages */}
            {status === 'success' && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded font-montserrat">
                ✓ Message sent successfully! We'll get back to you soon.
              </div>
            )}
            
            {status === 'error' && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-montserrat">
                ✗ Failed to send message. Please try again or email us directly at omultimart@gmail.com
              </div>
            )}

            {/* Email Name */}
            <div className="flex w-full justify-between">
              <div className="flex w-[48%] flex-col gap-1">
                <label htmlFor="name" className='font-montserratBold text-[14px]'>Name</label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder='Name' 
                  className='text-sm md:text-[16px] border border-buttons p-2 w-full font-montserrat outline-none text-body' 
                  required
                />
              </div>

              <div className="flex w-[48%] flex-col gap-1">
                <label htmlFor="email" className='font-montserratBold text-[14px]'>Email</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='Email' 
                  className='text-sm md:text-[16px] border w-full p-2 border-buttons font-montserrat outline-none text-body' 
                  required
                />
              </div>
            </div>
            
            {/* Phone */}
            <div className="flex w-full flex-col gap-1">
              <label htmlFor="phone" className='font-montserratBold text-[14px]'>Phone</label>
              <input 
                type="text" 
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder='Phone' 
                className='text-sm md:text-[16px] border border-buttons p-2 w-full font-montserrat outline-none text-body' 
              />
            </div>

            {/* Message */}
            <div className="flex w-full flex-col gap-1">
              <label htmlFor="message" className='font-montserratBold text-[14px]'>Message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder='Message' 
                className='text-sm md:text-[16px] border border-buttons p-2 h-[100px] w-full font-montserrat outline-none text-body'
                id="message"
                required
              ></textarea>
            </div>

            {/* buttons */}
            <div className="flex flex-start">
              <button 
                className='text-[12px] border text-buttons border-buttons p-3 font-montserratBold hover:bg-buttons transition duration-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed' 
                type="submit"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'SENDING...' : 'SUBMIT MESSAGE'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="px-[20px] md:px-[40px] lg:px-[60px] xl:px-[100px] flex justify-between pb-[50px] md:pb-[60px] xl:pb-[80px]">
        <img src={map} className='h-[250px] md:h-[300px] lg:h-[400px] w-full object-cover' alt="Location map" />
      </div>
    </div>
  );
};

export default Contactpage;