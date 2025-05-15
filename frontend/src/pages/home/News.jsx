import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';

import news1 from "../../assets/news/news-1.png"
import news2 from "../../assets/news/news-2.png"
import news3 from "../../assets/news/news-3.png"
import news4 from "../../assets/news/news-4.png"
import { Link } from 'react-router-dom';

const news = [
    {
        "id": 1,
        "title": "Hội nghị Thượng đỉnh về Khí hậu Toàn cầu kêu gọi hành động khẩn cấp",
        "description": "Các nhà lãnh đạo thế giới tập trung tại Hội nghị Thượng đỉnh về Khí hậu Toàn cầu để thảo luận về các chiến lược khẩn cấp nhằm chống biến đổi khí hậu, tập trung vào giảm phát thải carbon và thúc đẩy giải pháp năng lượng tái tạo.",
        "image": news1
    },
    {
        "id": 2,
        "title": "Công bố đột phá trong công nghệ AI",
        "description": "Một bước đột phá lớn trong lĩnh vực trí tuệ nhân tạo đã được các nhà nghiên cứu công bố, với những tiến bộ mới hứa hẹn sẽ cách mạng hóa các ngành từ y tế đến tài chính.",
        "image": news2
    },
    {
        "id": 3,
        "title": "Sứ mệnh vũ trụ mới nhằm khám phá các thiên hà xa xôi",
        "description": "NASA đã công bố kế hoạch cho một sứ mệnh vũ trụ mới nhằm khám phá các thiên hà xa xôi, với hy vọng tìm hiểu thêm về nguồn gốc của vũ trụ.",
        "image": news3
    },
    {
        "id": 4,
        "title": "Thị trường chứng khoán đạt mức cao kỷ lục trong bối cảnh phục hồi kinh tế",
        "description": "Thị trường chứng khoán toàn cầu đã đạt mức cao kỷ lục khi các dấu hiệu phục hồi kinh tế tiếp tục xuất hiện sau những thách thức do đại dịch toàn cầu gây ra.",
        "image": news4
    },
    {
        "id": 5,
        "title": "Công ty công nghệ hàng đầu ra mắt điện thoại thông minh đổi mới",
        "description": "Một công ty công nghệ hàng đầu đã ra mắt mẫu điện thoại thông minh mới nhất, với công nghệ tiên tiến, thời lượng pin được cải thiện và thiết kế mới thanh lịch.",
        "image": news2
    }
]

const News = () => {
  return (
    <div className='py-16'>
        <h2 className='text-3xl font-semibold mb-6'>Tin Tức</h2>

        <Swiper
        slidesPerView={1}
        spaceBetween={30}
        navigation={true}
        breakpoints={{
          640: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 40,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 50,
          },
        }}
        modules={[Pagination, Navigation]}
        className="mySwiper"
      >
        
        {
            news.map((item, index) => (
                <SwiperSlide key={index}>
                    <div className='flex flex-col sm:flex-row sm:justify-between items-center gap-12'>
                        {/* content */}
                        <div className='py-4'>
                            <Link to="/">
                                 <h3 className='text-lg font-medium hover:text-blue-500 mb-4'>{item.title}</h3>
                            </Link>
                            <div className='w-12 h-[4px] bg-primary mb-5'></div>
                            <p className='text-sm text-gray-600'>{item.description}</p>
                        </div>

                        <div className='flex-shrink-0'>
                            <img src={item.image} alt=""  className='w-full object-cover'/>
                        </div>
                    </div>
                </SwiperSlide>
            ) )
        }
      </Swiper>
    </div>
  )
}

export default News