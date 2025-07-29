import React from 'react';
import { LuWheat } from "react-icons/lu";
import { IoFastFoodOutline, IoStorefrontOutline } from "react-icons/io5";

const StatisticsSidebar = ({
  logo,
  testimonial = {
    quote: "Markendation giúp tôi lên kế hoạch bữa ăn và mua sắm thực phẩm hiệu quả. Tôi tiết kiệm được cả thời gian và tiền bạc khi sử dụng ứng dụng này.",
    author: "Trần Huyền",
    since: "2023",
    initials: "TH"
  }
}) => {
  return (
    <div className="hidden md:flex md:w-1/2 bg-green-50 p-8 flex-col justify-center items-center">
      <div className="max-w-lg w-full">
        <div className="mb-12 text-center">
          <img src={logo} alt="Markendation Logo" className="h-20 mx-auto mb-4" />
          <div className="w-16 h-1 bg-orange-500 mx-auto"></div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="text-center bg-white rounded-lg border border-orange-100 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-orange-300">
            <div className="bg-orange-500 text-white p-4 rounded-lg mb-3 flex items-center justify-center mx-auto w-16 h-16">
              <LuWheat className="h-8 w-8" />
            </div>
            <div className="font-bold text-xl">1,75,324</div>
            <div className="text-gray-600 text-sm">Loại Thực Phẩm</div>
          </div>
          <div className="text-center bg-white rounded-lg border border-orange-100 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-orange-300">
            <div className="bg-orange-500 text-white p-4 rounded-lg mb-3 flex items-center justify-center mx-auto w-16 h-16">
              <IoFastFoodOutline className="h-8 w-8" />
            </div>
            <div className="font-bold text-xl">97,354</div>
            <div className="text-gray-600 text-sm">Món Ăn</div>
          </div>
          <div className="text-center bg-white rounded-lg border border-orange-100 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-orange-300">
            <div className="bg-orange-500 text-white p-4 rounded-lg mb-3 flex items-center justify-center mx-auto w-16 h-16">
              <IoStorefrontOutline className="h-8 w-8" />
            </div>
            <div className="font-bold text-xl">7,532</div>
            <div className="text-gray-600 text-sm">Siêu thị, cửa hàng</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-green-100">
          <div className="flex justify-center mb-3">
            <div className="text-orange-500 text-3xl">❝</div>
          </div>
          <p className="text-gray-700 mb-4 text-center italic">
            {testimonial.quote}
          </p>
          <div className="flex items-center justify-center">
            <div className="bg-orange-100 rounded-full h-10 w-10 flex items-center justify-center mr-3 border border-orange-200">
              <span className="text-orange-700 font-bold">{testimonial.initials}</span>
            </div>
            <div>
              <h4 className="font-medium">{testimonial.author}</h4>
              <p className="text-gray-600 text-sm">Người dùng từ {testimonial.since}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsSidebar;