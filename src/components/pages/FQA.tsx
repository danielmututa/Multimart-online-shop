import React, { useState } from 'react';
import fqaImg from "../Images/Services.jpg";
import { Minus, Plus } from "lucide-react";
import faq from "../Images/FAQ1.jpg";
import faqtwo from "../Images/FAQ2.jpg";

const FQA: React.FC = () => {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <div>
            <div className="h-[420px] md:h-[430px] xl::h-[70vh] relative w-full">
                <img src={fqaImg} className='w-full object-cover h-full' alt="FAQ banner" />
                <div className="bg-blue-600/40 top-0 absolute w-full h-full flex flex-col gap-2 md:gap-3 px-[20px] md:px-[40px] lg:px-[60px] xl:px-[100px] items-center justify-center">
                    <h2 className='text-[20px] font-montserratBold text-white md:text-[23px] xl:text-[26px]'>FAQ</h2>
                    <p className='text-sm md:text-[16px] lg:text-[18px] text-white font-montserrat text-[16px] text-center'>
                        Have questions about our multi-mart online marketplace? We're here to help! Check out our frequently asked questions below to find answers about products, registration, and more. Need more info? Don't hesitate to reach out to our team!
                    </p>
                </div>
            </div>
            
            <div className="flex flex-col gap-12 lg:gap-16 px-[20px] md:px-[40px] lg:px-[60px] xl:px-[100px] py-[50px] md:py-[60px] xl:py-[80px]">
                <div className="flex flex-col md:flex-row justify-between">
                    <div className="w-full pb-8 md:pb-0 md:w-[45%]">
                        <p className='font-montserratBold text-buttons text-sm'>FREQUENTLY ASKED</p>
                        <h2 className='text-[20px] pb-4 md:pb-0 md:text-[23px] xl:text-[26px] font-montserratBold'>Getting Started & Registration</h2>

                        <div className="flex flex-col gap-4">
                            <div className="border flex-col flex p-2 justify-between border-buttons">
                                <div className="flex w-full justify-between">
                                    <p className="text-sm lg:text-[16px] font-montserrat">What Is Your Multi-Mart Marketplace?</p>
                                    {openFAQ === 0 ? (
                                        <Minus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(0)} />
                                    ) : (
                                        <Plus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(0)} />
                                    )}
                                </div>
                                {openFAQ === 0 && (
                                    <div className="pt-4">
                                        <p className="text-[15px] md:text-[16px] text-buttons font-montserrat">We are an online multi-mart e-commerce platform that accepts all types of products from registered sellers. Our marketplace connects buyers and sellers, offering a wide variety of products across multiple categories including electronics, fashion, home goods, and more.</p>
                                    </div>
                                )}
                            </div>

                            <div className="border flex-col flex p-2 justify-between border-buttons">
                                <div className="flex w-full justify-between">
                                    <p className="text-sm lg:text-[16px] font-montserrat">How Do I Register as a Client or Admin?</p>
                                    {openFAQ === 1 ? (
                                        <Minus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(1)} />
                                    ) : (
                                        <Plus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(1)} />
                                    )}
                                </div>
                                {openFAQ === 1 && (
                                    <div className="pt-4">
                                        <p className="text-sm md:text-[16px] text-buttons font-montserrat">To post and sell products on our platform, you need to register as a Client Admin. Simply click on the "Register" button, fill in your business details, and submit your application. Once approved, you'll be able to list and manage your products on our marketplace.</p>
                                    </div>
                                )}
                            </div>

                            <div className="border flex-col flex p-2 justify-between border-buttons">
                                <div className="flex w-full justify-between">
                                    <p className="text-sm lg:text-[16px] font-montserrat">What Products Can I Sell on Your Platform?</p>
                                    {openFAQ === 2 ? (
                                        <Minus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(2)} />
                                    ) : (
                                        <Plus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(2)} />
                                    )}
                                </div>
                                {openFAQ === 2 && (
                                    <div className="pt-4">
                                        <p className="text-sm md:text-[16px] text-buttons font-montserrat">Our platform accepts all types of products from registered sellers, including electronics, clothing, accessories, home goods, beauty products, sports equipment, and more. As long as your products comply with our terms of service and local regulations, you're welcome to list them on our marketplace.</p>
                                    </div>
                                )}
                            </div>

                            <div className="border flex-col flex p-2 justify-between border-buttons">
                                <div className="flex w-full justify-between">
                                    <p className="text-sm lg:text-[16px] font-montserrat">Is Registration Free?</p>
                                    {openFAQ === 3 ? (
                                        <Minus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(3)} />
                                    ) : (
                                        <Plus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(3)} />
                                    )}
                                </div>
                                {openFAQ === 3 && (
                                    <div className="pt-4">
                                        <p className="text-sm md:text-[16px] text-buttons font-montserrat">Yes, registration as a Client Admin is completely free! We only charge a small commission on successful sales made through our platform. This allows you to start selling without any upfront costs.</p>
                                    </div>
                                )}
                            </div>

                            <div className="border flex items-center p-2 justify-between border-buttons">
                                <p className="text-[15px] lg:text-[16px] font-montserrat">Still Have Questions</p>
                                <button className='p-2 bg-buttons text-white mr-5'>Get in touch</button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-[45%]">
                        <img src={faq} className='h-[300px] md:h-[450px] w-full object-cover' alt="FAQ illustration" />
                    </div>
                </div>

                <div className="flex flex-col-reverse md:flex-row justify-between">
                    <div className="w-full md:w-[45%]">
                        <img src={faqtwo} className='pt-8 md:pt-0 h-[300px] md:h-[450px] w-full object-cover' alt="Pricing and payments illustration" />
                    </div>

                    <div className="w-full md:w-[45%]">
                        <p className='font-montserratBold text-buttons text-sm'>FREQUENTLY ASKED</p>
                        <h2 className='text-[20px] md:text-[23px] xl:text-[26px] font-montserratBold'>Pricing & Payments</h2>

                        <div className="flex flex-col gap-4">
                            <div className="border flex-col flex p-2 justify-between border-buttons">
                                <div className="flex w-full justify-between">
                                    <p className="text-sm lg:text-[16px] font-montserrat">What Are Your Commission Rates?</p>
                                    {openFAQ === 4 ? (
                                        <Minus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(4)} />
                                    ) : (
                                        <Plus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(4)} />
                                    )}
                                </div>
                                {openFAQ === 4 && (
                                    <div className="pt-4">
                                        <p className="text-sm md:text-[16px] text-buttons font-montserrat">Our commission rates vary depending on the product category, but typically range from 5-15% per sale. This competitive rate allows you to maximize your profits while benefiting from our large customer base and secure platform.</p>
                                    </div>
                                )}
                            </div>

                            <div className="border flex-col flex p-2 justify-between border-buttons">
                                <div className="flex w-full justify-between">
                                    <p className="text-sm lg:text-[16px] font-montserrat">What Payment Methods Do You Accept?</p>
                                    {openFAQ === 5 ? (
                                        <Minus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(5)} />
                                    ) : (
                                        <Plus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(5)} />
                                    )}
                                </div>
                                {openFAQ === 5 && (
                                    <div className="pt-4">
                                        <p className="text-sm md:text-[16px] text-buttons font-montserrat">We accept all major payment methods including credit/debit cards, mobile money, bank transfers, and digital wallets. Our secure payment gateway ensures that both buyers and sellers have a safe transaction experience.</p>
                                    </div>
                                )}
                            </div>

                            <div className="border flex-col flex p-2 justify-between border-buttons">
                                <div className="flex w-full justify-between">
                                    <p className="text-sm lg:text-[16px] font-montserrat">When Do I Receive My Payments?</p>
                                    {openFAQ === 6 ? (
                                        <Minus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(6)} />
                                    ) : (
                                        <Plus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(6)} />
                                    )}
                                </div>
                                {openFAQ === 6 && (
                                    <div className="pt-4">
                                        <p className="text-sm md:text-[16px] text-buttons font-montserrat">Payments are processed within 3-5 business days after the customer receives their order and confirms satisfaction. We hold payments briefly to ensure customer satisfaction and reduce fraud, protecting both buyers and sellers.</p>
                                    </div>
                                )}
                            </div>

                            <div className="border flex-col flex p-2 justify-between border-buttons">
                                <div className="flex w-full justify-between">
                                    <p className="text-sm lg:text-[16px] font-montserrat">Do You Offer Seller Protection?</p>
                                    {openFAQ === 7 ? (
                                        <Minus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(7)} />
                                    ) : (
                                        <Plus className="mr-5 cursor-pointer" size={20} onClick={() => handleToggle(7)} />
                                    )}
                                </div>
                                {openFAQ === 7 && (
                                    <div className="pt-4">
                                        <p className="text-sm md:text-[16px] text-buttons font-montserrat">Yes! We offer comprehensive seller protection against fraudulent claims and disputes. Our dedicated support team investigates all cases fairly and works to ensure legitimate sellers are protected throughout the selling process.</p>
                                    </div>
                                )}
                            </div>

                            <div className="border flex items-center p-2 justify-between border-buttons">
                                <p className="text-[15px] lg:text-[16px] font-montserrat">Still Have Questions</p>
                                <button className='p-2 bg-buttons text-white mr-5'>Get in touch</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FQA;