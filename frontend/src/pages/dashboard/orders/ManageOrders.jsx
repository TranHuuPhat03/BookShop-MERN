import { useState, useEffect } from 'react';
import axios from 'axios';
import getBaseUrl from '../../../utils/baseURL';
import Loading from '../../../components/Loading';
import { format } from 'date-fns';
import { FaEye } from 'react-icons/fa';
import { getImgUrl } from '../../../utils/getImgUrl';
import PropTypes from 'prop-types';

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
      const itemPrice = price || (book && book.newPrice) || 0;
      return formatPrice(itemPrice * quantity);
  };
  
  if (!book) return <li>Không có thông tin sách</li>;
  
  // Use price from order first, fallback to book price
  const displayPrice = price || book.newPrice || 0;
  
  return (
      <li className="py-1">
          <div className="flex items-center justify-between">
              <div className="flex items-center">
                  {book.coverImage && (
                      <img src={getImgUrl(book.coverImage)} alt={book.title} className="w-10 h-10 object-cover mr-2 rounded-sm" />
                  )}
                  <div>
                      <span className="font-medium">{book.title}</span>
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
      _id: PropTypes.string,
      title: PropTypes.string,
      oldPrice: PropTypes.number,
      newPrice: PropTypes.number,
      coverImage: PropTypes.string
    }).isRequired,
    quantity: PropTypes.number,
    price: PropTypes.number
  }).isRequired
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const baseUrl = getBaseUrl();
      const response = await axios.get(`${baseUrl}/api/orders/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Kiểm tra response và format dữ liệu nếu cần
      const processedOrders = response.data.map(order => ({
        ...order,
        status: order.status || 'pending',
        user: { username: order.email || 'Khách' },
        totalAmount: order.totalPrice,
        products: order.products?.map(prod => {
          const productId = typeof prod.productId === 'string' ? {
            _id: prod.productId,
            title: 'Đang tải...',
            oldPrice: 0,
            newPrice: 0,
            coverImage: ''
          } : prod.productId;

          return {
            ...prod,
            productId,
            price: prod.price || 0,
            quantity: prod.quantity || 1
          };
        }) || []
      }));
      
      setOrders(processedOrders);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.response) {
        setError(`Lỗi máy chủ: ${err.response.status} - ${err.response.data.message || 'Không thể tải đơn hàng'}`);
      } else if (err.request) {
        setError('Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } else {
        setError(`Lỗi: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(
        `${getBaseUrl()}/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const updatedOrders = orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date() } 
          : order
      );
      
      setOrders(updatedOrders);
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      alert('Cập nhật trạng thái đơn hàng thành công');
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (loading && !orders.length) return <Loading />;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Quản lý đơn hàng</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 rounded-md ${statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
            onClick={() => setStatusFilter('all')}
          >
            Tất cả
          </button>
          <button 
            className={`px-3 py-1 rounded-md ${statusFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-yellow-200'}`}
            onClick={() => setStatusFilter('pending')}
          >
            Chờ xử lý
          </button>
          <button 
            className={`px-3 py-1 rounded-md ${statusFilter === 'processing' ? 'bg-blue-600 text-white' : 'bg-blue-200'}`}
            onClick={() => setStatusFilter('processing')}
          >
            Đang xử lý
          </button>
          <button 
            className={`px-3 py-1 rounded-md ${statusFilter === 'shipped' ? 'bg-purple-600 text-white' : 'bg-purple-200'}`}
            onClick={() => setStatusFilter('shipped')}
          >
            Đã giao vận
          </button>
          <button 
            className={`px-3 py-1 rounded-md ${statusFilter === 'delivered' ? 'bg-green-600 text-white' : 'bg-green-200'}`}
            onClick={() => setStatusFilter('delivered')}
          >
            Đã giao hàng
          </button>
          <button 
            className={`px-3 py-1 rounded-md ${statusFilter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-red-200'}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            Đã hủy
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Mã đơn hàng</th>
                <th className="py-3 px-6 text-left">Khách hàng</th>
                <th className="py-3 px-6 text-left">Ngày đặt</th>
                <th className="py-3 px-6 text-left">Tổng tiền</th>
                <th className="py-3 px-6 text-left">Trạng thái</th>
                <th className="py-3 px-6 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 px-6 text-center">Không tìm thấy đơn hàng nào</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">
                      <span className="font-medium">{order._id.substring(0, 8)}...</span>
                    </td>
                    <td className="py-3 px-6 text-left">
                      {order.name || order.email || "Khách hàng"}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {order.createdAt ? format(new Date(order.createdAt), 'dd/MM/yyyy') : 'N/A'}
                    </td>
                    <td className="py-3 px-6 text-left">
                      ${order.totalPrice?.toFixed(2) || order.totalAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="py-3 px-6 text-left">
                      <span className={`py-1 px-3 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status === 'pending' ? 'CHỜ XỬ LÝ' : 
                         order.status === 'processing' ? 'ĐANG XỬ LÝ' :
                         order.status === 'shipped' ? 'ĐÃ GIAO VẬN' :
                         order.status === 'delivered' ? 'ĐÃ GIAO HÀNG' :
                         order.status === 'cancelled' ? 'ĐÃ HỦY' : 
                         order.status?.toUpperCase() || "CHỜ XỬ LÝ"}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="transform hover:scale-110 transition-transform duration-300 text-blue-600 hover:text-blue-900 mx-2"
                        >
                          <FaEye className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Chi tiết đơn hàng</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <p><span className="font-semibold">Mã đơn hàng:</span> {selectedOrder._id}</p>
                <p><span className="font-semibold">Khách hàng:</span> {selectedOrder.name || selectedOrder.email || "Khách hàng"}</p>
                <p><span className="font-semibold">Email:</span> {selectedOrder.email || "N/A"}</p>
                <p><span className="font-semibold">Số điện thoại:</span> {selectedOrder.phone || "N/A"}</p>
                <p><span className="font-semibold">Ngày đặt:</span> {selectedOrder.createdAt ? format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}</p>
                <p>
                  <span className="font-semibold">Trạng thái:</span> 
                  <span className={`ml-2 py-1 px-3 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status === 'pending' ? 'CHỜ XỬ LÝ' : 
                     selectedOrder.status === 'processing' ? 'ĐANG XỬ LÝ' :
                     selectedOrder.status === 'shipped' ? 'ĐÃ GIAO VẬN' :
                     selectedOrder.status === 'delivered' ? 'ĐÃ GIAO HÀNG' :
                     selectedOrder.status === 'cancelled' ? 'ĐÃ HỦY' : 
                     selectedOrder.status?.toUpperCase() || "CHỜ XỬ LÝ"}
                  </span>
                </p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Địa chỉ giao hàng:</h4>
                <p>{selectedOrder.address?.city || 'N/A'}</p>
                <p>{selectedOrder.address?.state || ''}</p>
                <p>{selectedOrder.address?.country || ''}</p>
                <p>{selectedOrder.address?.zipcode || ''}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Sản phẩm đặt hàng:</h4>
                <ul className="mt-2 space-y-1 border p-2 rounded bg-gray-50">
                  {selectedOrder.products && Array.isArray(selectedOrder.products) 
                    ? selectedOrder.products.map((product) => (
                        <BookItem 
                          key={product.productId._id || product.productId} 
                          product={product}
                        />
                      ))
                    : <li>Không tìm thấy sản phẩm nào</li>
                  }
                </ul>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div>
                  <p className="font-semibold">Tổng cộng: ${selectedOrder.totalPrice?.toFixed(2) || selectedOrder.totalAmount?.toFixed(2) || "0.00"}</p>
                </div>
                <div className="flex space-x-2">
                  <select
                    className="border rounded-md px-3 py-1"
                    value={selectedOrder.status}
                    onChange={(e) => setSelectedOrder({...selectedOrder, status: e.target.value})}
                    disabled={loading}
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="shipped">Đã giao vận</option>
                    <option value="delivered">Đã giao hàng</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                  <button
                    className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700"
                    onClick={() => updateOrderStatus(selectedOrder._id, selectedOrder.status)}
                    disabled={loading}
                  >
                    Cập nhật
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders; 