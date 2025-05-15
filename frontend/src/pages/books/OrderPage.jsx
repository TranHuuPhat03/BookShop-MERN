import { useGetOrderByEmailQuery } from '../../redux/features/orders/ordersApi'
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';
import { getImgUrl } from '../../utils/getImgUrl';

const BookItem = ({ product }) => {
    const book = product.productId;
    const quantity = product.quantity || 1;
    const price = product.price;
    
    // Format price for display
    const formatPrice = (value) => {
        if (value === undefined || value === null) return "0.00";
        return typeof value === 'number' ? value.toFixed(2) : value;
    };
    
    // Calculate item total
    const calculateTotal = () => {
        const itemPrice = price || (book && (book.newPrice || book.price)) || 0;
        return formatPrice(itemPrice * quantity);
    };
    
    if (!book) return <li>Không có thông tin sách</li>;
    
    // Use price from order first, fallback to book price
    const displayPrice = price || book.newPrice || book.price || 0;
    
    return (
        <li className="py-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {book.coverImage && (
                        <img src={getImgUrl(book.coverImage)} alt={book.title} className="w-10 h-10 object-cover mr-2 rounded-sm" />
                    )}
                    <div>
                        <span className="font-medium">{book.title}</span>
                        {book.author && <span className="text-gray-500 text-sm ml-2">bởi {book.author}</span>}
                    </div>
                </div>
                <div className="flex items-center">
                    <span className="text-gray-600 mr-4">× {quantity}</span>
                    <span className="text-gray-600">${formatPrice(displayPrice)}</span>
                </div>
            </div>
            <div className="text-right text-sm text-gray-500">
                Tổng phụ: ${calculateTotal()}
            </div>
        </li>
    );
};

BookItem.propTypes = {
    product: PropTypes.shape({
        productId: PropTypes.shape({
            title: PropTypes.string,
            author: PropTypes.string,
            price: PropTypes.number,
            newPrice: PropTypes.number,
            coverImage: PropTypes.string
        }),
        quantity: PropTypes.number,
        price: PropTypes.number
    }).isRequired
};

const getStatusColor = (status) => {
    switch (status) {
        case 'pending':
            return 'bg-yellow-200 text-yellow-800';
        case 'processing':
            return 'bg-blue-200 text-blue-800';
        case 'shipped':
            return 'bg-purple-200 text-purple-800';
        case 'delivered':
            return 'bg-green-200 text-green-800';
        case 'cancelled':
            return 'bg-red-200 text-red-800';
        default:
            return 'bg-gray-200 text-gray-800';
    }
};

const getStatusText = (status) => {
    switch (status) {
        case 'pending':
            return 'Chờ xử lý';
        case 'processing':
            return 'Đang xử lý';
        case 'shipped':
            return 'Đã giao vận';
        case 'delivered':
            return 'Đã giao hàng';
        case 'cancelled':
            return 'Đã hủy';
        default:
            return status?.toUpperCase() || 'Chờ xử lý';
    }
};

const OrderPage = () => {
    const { currentUser } = useAuth();
    const { data: orders = [], isLoading, isError } = useGetOrderByEmailQuery(currentUser?.email, {
        skip: !currentUser?.email
    });
    
    if (isLoading) return <div className="container mx-auto p-6">Đang tải...</div>;
    if (isError) return <div className="container mx-auto p-6">Lỗi khi tải dữ liệu đơn hàng</div>;
    
    return (
        <div className='container mx-auto p-6'>
            <h2 className='text-2xl font-semibold mb-4'>Đơn hàng của bạn</h2>
            {
                orders.length === 0 ? (<div>Không tìm thấy đơn hàng nào!</div>) : (<div>
                    {
                        orders.map((order, index) => (
                            <div key={order._id} className="border-b mb-6 pb-4 shadow-sm rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <p className='p-1 bg-secondary text-white w-10 rounded mb-1 text-center'># {index + 1}</p>
                                    <span className={`py-1 px-3 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                </div>
                                <h2 className="font-bold">Mã đơn hàng: {order._id}</h2>
                                <p className="text-gray-600">Họ tên: {order.name}</p>
                                <p className="text-gray-600">Email: {order.email}</p>
                                <p className="text-gray-600">Số điện thoại: {order.phone}</p>
                                <p className="text-gray-600">Tổng tiền: ${order.totalPrice}</p>
                                {order.createdAt && (
                                    <p className="text-gray-600">Ngày đặt hàng: {new Date(order.createdAt).toLocaleDateString()}</p>
                                )}
                                {order.status === 'delivered' && order.deliveredAt && (
                                    <p className="text-gray-600">Ngày giao hàng: {new Date(order.deliveredAt).toLocaleDateString()}</p>
                                )}
                                <h3 className="font-semibold mt-2">Địa chỉ:</h3>
                                <p> {order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}</p>
                                <h3 className="font-semibold mt-2">Sách đã đặt:</h3>
                                <ul className="mt-2 space-y-1 border p-2 rounded bg-gray-50">
                                    {order.products && Array.isArray(order.products) 
                                        ? order.products.map((product) => (
                                            <BookItem 
                                                key={product.productId?._id || product.productId || Math.random()} 
                                                product={product}
                                            />
                                        ))
                                        : <li>Không tìm thấy sản phẩm nào</li>
                                    }
                                </ul>
                            </div>
                        ))
                    }
                </div>)
            }
        </div>
    )
}

export default OrderPage