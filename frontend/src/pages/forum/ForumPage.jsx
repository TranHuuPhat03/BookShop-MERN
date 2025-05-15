import { useState } from 'react';
import { useGetPostsQuery } from '../../redux/features/forum/forumApi';
import { Link } from 'react-router-dom';
import { FaEye, FaComment, FaThumbsUp } from 'react-icons/fa';
import Loading from '../../components/Loading';

const ForumPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    
    const { data, isLoading, error } = useGetPostsQuery({
        page: currentPage,
        category,
        search
    });

    const categories = [
        { value: '', label: 'Tất cả' },
        { value: 'general', label: 'Chung' },
        { value: 'question', label: 'Câu hỏi' },
        { value: 'review', label: 'Đánh giá' },
        { value: 'discussion', label: 'Thảo luận' }
    ];

    if (isLoading) return <Loading />;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Diễn đàn</h1>
                <Link
                    to="/forum/new"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Tạo bài viết mới
                </Link>
            </div>

            <div className="mb-6 flex gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết..."
                        className="w-full px-4 py-2 border rounded"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 border rounded"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid gap-4">
                {data?.posts.map((post) => (
                    <div key={post._id} className="bg-white p-6 rounded-lg shadow">
                        <Link to={`/forum/${post._id}`}>
                            <h2 className="text-xl font-semibold mb-2 hover:text-blue-500">
                                {post.title}
                            </h2>
                        </Link>
                        <p className="text-gray-600 mb-4">
                            {post.content.substring(0, 200)}...
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {categories.find(cat => cat.value === post.category)?.label}
                                </span>
                                <span>bởi {post.author.username}</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <FaEye /> {post.views}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FaComment /> {post.comments.length}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FaThumbsUp /> {post.likes.length}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {data?.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {[...Array(data.totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-4 py-2 rounded ${
                                currentPage === i + 1
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ForumPage; 