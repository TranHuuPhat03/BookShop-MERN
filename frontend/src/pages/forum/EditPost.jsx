import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetPostQuery, useUpdatePostMutation } from '../../redux/features/forum/forumApi';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { data: post, isLoading: isLoadingPost } = useGetPostQuery(id);
    const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'general',
        tags: ''
    });

    const categories = [
        { value: 'general', label: 'Chung' },
        { value: 'question', label: 'Câu hỏi' },
        { value: 'review', label: 'Đánh giá' },
        { value: 'discussion', label: 'Thảo luận' }
    ];

    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title,
                content: post.content,
                category: post.category,
                tags: post.tags.join(', ')
            });
        }
    }, [post]);

    // Check if user is author or admin
    const isAuthorOrAdmin = () => {
        if (!currentUser || !post) return false;
        // Get user info from token
        const userInfo = JSON.parse(localStorage.getItem('user_info'));
        // Check if user is author or has admin role
        return post.author.username === currentUser.email || userInfo?.role === 'admin';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const tags = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);

            await updatePost({
                id,
                ...formData,
                tags
            }).unwrap();

            navigate(`/forum/${id}`);
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (isLoadingPost) return <Loading />;
    
    if (!isAuthorOrAdmin()) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Bạn không có quyền chỉnh sửa bài viết này.</p>
                    <Link to={`/forum/${id}`} className="text-red-700 underline">
                        Quay lại bài viết
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Chỉnh sửa bài viết</h1>
                <Link to={`/forum/${id}`} className="text-blue-500 hover:underline">
                    Hủy
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Tiêu đề
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Nội dung
                    </label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                        rows="10"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Danh mục
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                    >
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Tags (phân cách bằng dấu phẩy)
                    </label>
                    <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="sách, review, thảo luận"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    <Link
                        to={`/forum/${id}`}
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                        Hủy
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default EditPost; 