import React, { useEffect, useState } from 'react';
import bannerImg from "../../assets/banner.png";
import NewsletterPopup from '../../components/NewsletterPopup';

const Banner = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.preny.ai/embed-global.js';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-button-style', 'width:200px;height:200px');
    script.setAttribute('data-preny-bot-id', '68067e3f0d106305a0903d7b');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <div className='flex flex-col md:flex-row-reverse py-16 justify-between items-center gap-12'>
        <div className='md:w-1/2 w-full flex items-center md:justify-end'>
          <img src={bannerImg} alt="" />
        </div>
        
        <div className='md:w-1/2 w-full'>
          <h1 className='md:text-5xl text-2xl font-medium mb-7'>Sách Mới Trong Tuần</h1>
          <p className='mb-10'>Đã đến lúc cập nhật danh sách đọc của bạn với một số tác phẩm mới nhất và hay nhất trong thế giới văn học. Từ những cuốn sách giật gân đến hồi ký cuốn hút, những tựa sách mới trong tuần này sẽ mang đến điều thú vị cho mọi người</p>

          <button 
            className='btn-primary'
            onClick={() => setIsPopupOpen(true)}
          >
            Đăng ký
          </button>
        </div>
      </div>

      <NewsletterPopup 
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
};

export default Banner;