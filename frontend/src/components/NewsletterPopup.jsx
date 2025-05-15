import React, { useState } from 'react';
import PropTypes from 'prop-types';

const NewsletterPopup = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Hiển thị thông báo cảm ơn
        setMessage('Cảm ơn bạn đã đăng ký! Chúng tôi sẽ gửi thông tin sớm nhất.');
        setEmail('');
        
        // Đóng popup sau 3 giây
        setTimeout(() => {
            onClose();
            setMessage('');
        }, 1000);
        
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Đăng ký nhận tin</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                <p className="text-gray-600 mb-4">
                    Đăng ký để nhận thông tin về sách mới và khuyến mãi đặc biệt!
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email của bạn"
                        className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký ngay'}
                    </button>
                </form>
                {message && (
                    <p className="mt-4 text-center text-green-600">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

NewsletterPopup.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default NewsletterPopup; 