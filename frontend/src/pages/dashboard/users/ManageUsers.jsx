import { useState, useEffect } from 'react';
import axios from 'axios';
import getBaseUrl from '../../../utils/baseURL';
import Loading from '../../../components/Loading';
import { FaUserShield, FaUser } from 'react-icons/fa';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${getBaseUrl()}/api/auth/all-users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
      });
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng:', err);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setActionInProgress(true);
      await axios.put(
        `${getBaseUrl()}/api/auth/update-role/${userId}`,
        { role: newRole },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setUsers(users.map(user => {
        if (user._id === userId) {
          return { ...user, role: newRole };
        }
        return user;
      }));
      
      alert(`Đã cập nhật vai trò người dùng thành ${newRole === 'admin' ? 'Quản trị viên' : 'Người dùng'}`);
    } catch (err) {
      console.error('Lỗi khi cập nhật vai trò:', err);
      alert(err.response?.data?.message || 'Không thể cập nhật vai trò người dùng');
    } finally {
      setActionInProgress(false);
    }
  };

  const handlePromoteToAdmin = (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn thăng cấp người dùng này thành quản trị viên?')) {
      updateUserRole(userId, 'admin');
    }
  };

  const handleDemoteToUser = (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn hạ cấp quản trị viên này thành người dùng thông thường?')) {
      updateUserRole(userId, 'user');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-semibold mb-6">Quản lý người dùng</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
            <tr>
              <th className="py-3 px-6 text-left">Tên người dùng</th>
              <th className="py-3 px-6 text-left">Vai trò</th>
              <th className="py-3 px-6 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {users.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-4 px-6 text-center">Không tìm thấy người dùng nào</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left">
                    {user.username}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <div className="flex items-center">
                      {user.role === 'admin' ? (
                        <span className="bg-purple-200 text-purple-800 py-1 px-3 rounded-full text-xs flex items-center">
                          <FaUserShield className="mr-1" /> Quản trị viên
                        </span>
                      ) : (
                        <span className="bg-green-200 text-green-800 py-1 px-3 rounded-full text-xs flex items-center">
                          <FaUser className="mr-1" /> Người dùng
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center">
                      {user.role === 'user' ? (
                        <button
                          onClick={() => handlePromoteToAdmin(user._id)}
                          disabled={actionInProgress}
                          className="transform hover:scale-110 transition-transform duration-300 text-blue-600 hover:text-blue-900 mx-2 disabled:opacity-50"
                        >
                          Thăng cấp thành Quản trị viên
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDemoteToUser(user._id)}
                          disabled={actionInProgress}
                          className="transform hover:scale-110 transition-transform duration-300 text-orange-600 hover:text-orange-900 mx-2 disabled:opacity-50"
                        >
                          Hạ cấp thành Người dùng
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers; 