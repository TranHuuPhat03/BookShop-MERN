import { useAuth } from '../../../context/AuthContext';
import { useGetOrderByEmailQuery } from '../../../redux/features/orders/ordersApi';

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

const UserDashboard = () => {
    const { currentUser } = useAuth();
    const { data: orders = [], isLoading, isError } = useGetOrderByEmailQuery(currentUser?.email);

    if (isLoading) return <div>Đang tải...</div>;
    if (isError) return <div>Lỗi khi tải dữ liệu đơn hàng</div>;

    return (
        <div className=" bg-gray-100 py-16">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-4">Bảng điều khiển người dùng</h1>
                <p className="text-gray-700 mb-6">Xin chào, {currentUser?.name || 'Người dùng'}! Đây là các đơn hàng gần đây của bạn:</p>

                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>
                    {orders.length > 0 ? (
                        <ul className="space-y-4">
                            {orders.map((order) => (
                                <li key={order._id} className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-1">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium">Mã đơn hàng: {order._id}</p>
                                        <span className={`py-1 px-3 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                    <p>Ngày đặt: {new Date(order?.createdAt).toLocaleDateString()}</p>
                                    <p>Tổng tiền: ${order.totalPrice}</p>
                                    {order.products && order.products.length > 0 ? (
                                        <div className="mt-2">
                                            <p className="font-medium">Sản phẩm:</p>
                                            <ul className="pl-4 mt-1">
                                                {order.products.map((product, index) => (
                                                    <li key={index} className="text-sm">
                                                        {product.productId && typeof product.productId === 'object' 
                                                            ? product.productId.title 
                                                            : `Sản phẩm ${index + 1}`}
                                                        {product.quantity > 1 && ` (x${product.quantity})`}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : order.productIds && order.productIds.length > 0 ? (
                                        <div className="mt-2">
                                            <p className="font-medium">Sản phẩm:</p>
                                            <p className="text-sm">{order.productIds.length} sản phẩm</p>
                                        </div>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600">Bạn chưa có đơn hàng nào.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
