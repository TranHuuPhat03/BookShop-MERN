import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetPostQuery, useAddCommentMutation, useToggleLikeMutation, useDeletePostMutation } from '../../redux/features/forum/forumApi';
import { FaThumbsUp, FaEye, FaComment, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [commentContent, setCommentContent] = useState('');
    
    const { data: post, isLoading, error } = useGetPostQuery(id);
    const [addComment] = useAddCommentMutation();
    const [toggleLike] = useToggleLikeMutation();
    const [deletePost] = useDeletePostMutation();

    // Check if user is author or admin
    const isAuthorOrAdmin = () => {
        if (!currentUser || !post) return false;
        // Get user info from token
        const userInfo = JSON.parse(localStorage.getItem('user_info'));
        // Check if user is author or has admin role
        return post.author.username === currentUser.email || userInfo?.role === 'admin';
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        try {
            await addComment({ postId: id, content: commentContent });
            setCommentContent('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleLike = async () => {
        try {
            await toggleLike(id);
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleEdit = () => {
        navigate(`/forum/edit/${id}`);
    };

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
            try {
                await deletePost(id);
                navigate('/forum');
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <div className="text-red-500">Error: {error.message}</div>;

    const isLiked = post?.likes.includes(currentUser?.id);

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/forum" className="text-blue-500 hover:underline mb-4 inline-block">
                &larr; Quay lại diễn đàn
            </Link>

            <article className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <header className="mb-4">
                    <div className="flex justify-between items-start">
                        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
                        {isAuthorOrAdmin() && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleEdit}
                                    className="text-blue-500 hover:text-blue-600"
                                    title="Chỉnh sửa"
                                >
                                    <FaEdit size={20} />
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="text-red-500 hover:text-red-600"
                                    title="Xóa"
                                >
                                    <FaTrash size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Đăng bởi {post.author.username}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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
                </header>

                <div className="prose max-w-none mb-6">
                    {post.content}
                </div>

                <div className="flex items-center gap-4 border-t pt-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded ${
                            isLiked
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        disabled={!currentUser}
                    >
                        <FaThumbsUp />
                        {isLiked ? 'Đã thích' : 'Thích'}
                    </button>
                </div>
            </article>

            <section className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Bình luận ({post.comments.length})</h2>

                {currentUser ? (
                    <form onSubmit={handleAddComment} className="mb-6">
                        <textarea
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Viết bình luận của bạn..."
                            className="w-full p-4 border rounded mb-2"
                            rows="3"
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            disabled={!commentContent.trim()}
                        >
                            Gửi bình luận
                        </button>
                    </form>
                ) : (
                    <p className="mb-6 text-gray-600">
                        Vui lòng <Link to="/login" className="text-blue-500 hover:underline">đăng nhập</Link> để bình luận.
                    </p>
                )}

                <div className="space-y-4">
                    {post.comments.map((comment) => (
                        <div key={comment._id} className="border-b pb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">{comment.author.username}</span>
                                <span className="text-gray-500 text-sm">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p>{comment.content}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default PostDetail; 