import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePostMutation } from '../../redux/features/forum/forumApi';
import Loading from '../../components/Loading';

const CreatePost = () => {
    const navigate = useNavigate();
    const [createPost, { isLoading }] = useCreatePostMutation();
    
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const tags = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);

            const result = await createPost({
                ...formData,
                tags
            }).unwrap();

            navigate(`/forum/${result._id}`);
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (isLoading) return <Loading />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Tạo bài viết mới</h1>

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
                        disabled={isLoading}
                    >
                        Đăng bài
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/forum')}
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost; 