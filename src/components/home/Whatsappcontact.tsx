import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppContactProps {
  phone: string;
  productName: string;
  className?: string;
}

const WhatsAppContact: React.FC<WhatsAppContactProps> = ({ 
  phone, 
  productName,
  className = '' 
}) => {
  // Clean phone number (remove spaces, dashes, parentheses, etc.)
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Create WhatsApp message
  const message = encodeURIComponent(
    `Hi! I'm interested in "${productName}". Can you provide more details?`
  );
  
  // WhatsApp link - uses the cleaned phone number from client_admin
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
  
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-full py-3 px-6 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 ${className}`}
    >
      <MessageCircle size={20} />
      <span>Contact Seller on WhatsApp</span>
    </a>
  );
};

export default WhatsAppContact;