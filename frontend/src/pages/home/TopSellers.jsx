import React, { useEffect, useState } from 'react'
import BookCard from '../books/BookCard';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// import required modules
import { Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';

const categories = ["Chọn thể loại", "Kinh doanh", "Tiểu thuyết", "Kinh dị", "Phiêu lưu"]

const TopSellers = () => {
    
    const [selectedCategory, setSelectedCategory] = useState("Chọn thể loại");

   const {data: books = []} = useFetchAllBooksQuery();
  
    const filteredBooks = selectedCategory === "Chọn thể loại" ? books : books.filter(book => {
        const categoryMap = {
            "Kinh doanh": "business",
            "Tiểu thuyết": "fiction",
            "Kinh dị": "horror",
            "Phiêu lưu": "adventure"
        };
        return book.category === categoryMap[selectedCategory]?.toLowerCase();
    });

    return (
        <div className='py-10'>
            <h2 className='text-3xl font-semibold mb-6'>Sách Bán Chạy</h2>
            {/* category filtering */}
            <div className='mb-8 flex items-center'>
                <select
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    name="category" id="category" className='border bg-[#EAEAEA] border-gray-300 rounded-md px-4 py-2 focus:outline-none'>
                    {
                        categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))
                    }
                </select>
            </div>

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
                    1180: {
                        slidesPerView: 3,
                        spaceBetween: 50,
                    }
                }}
                modules={[Pagination, Navigation]}
                className="mySwiper"
            >

                {
                   filteredBooks.length > 0 && filteredBooks.map((book, index) => (
                        <SwiperSlide key={index}>
                            <BookCard  book={book} />
                        </SwiperSlide>
                    ))
                }

            </Swiper>

        </div>
    )
}

export default TopSellers