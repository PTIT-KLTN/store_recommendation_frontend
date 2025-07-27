import React from 'react';
import { FaGithub, FaLinkedin, FaCode, FaEnvelope } from 'react-icons/fa';
import logoImage from '../assets/images/logo.png';


export const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-green-700 to-green-900 text-white py-5 mt-16">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                    {/* Logo và Giới thiệu */}
                    <div className="md:w-2/5">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            <img src={logoImage} alt="Markendation Logo" className="w-32 mr-2" />
                            
                        </h3>
                        <p className="text-gray-200 leading-relaxed">
                            Nền tảng thông minh giúp tìm kiếm cửa hàng dựa trên nguyên liệu bạn cần.
                        </p>
                    </div>

                    {/* Nhóm phát triển */}
                    <div className="md:w-2/5">
                        <h3 className="text-xl font-bold mb-4 pb-2 border-b border-green-500">
                            ĐỒ ÁN THỰC TẬP TỐT NGHIỆP
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                            <div className="bg-green-800 bg-opacity-50 p-3 rounded-lg">
                                <h4 className="font-medium">Nguyễn Phương Thảo</h4>
                                <p className="text-green-300 text-sm flex items-center">
                                    <FaCode className="mr-2" /> N21DCCN078
                                </p>
                            </div>
                            <div className="bg-green-800 bg-opacity-50 p-3 rounded-lg">
                                <h4 className="font-medium">Nguyễn Thị Minh Thư</h4>
                                <p className="text-green-300 text-sm flex items-center">
                                    <FaCode className="mr-2" /> N21DCCN082
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-green-600 mt-10 pt-3 text-center text-green-200">
                    <p>© 2025 MARKENDATION. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;