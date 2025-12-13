import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { postApi } from "@/services/api";
import { Post } from "@/types";
import { useAuthStore } from "@/store/authStore";
import Loading from "@/components/Loading";
import { formatDateTime } from "@/utils/helpers";
import toast from "react-hot-toast";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await postApi.getPost(id!);
      setPost(data);
      setLikesCount(data.likes.length);
      if (user) {
        setIsLiked(data.likes.includes(user._id));
      }
    } catch (error) {
      console.error("Failed to fetch post:", error);
      toast.error("文章不存在");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("请先登录");
      navigate("/login");
      return;
    }

    try {
      const data = await postApi.likePost(id!);
      setIsLiked(data.isLiked);
      setLikesCount(data.likes);
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("请先登录");
      navigate("/login");
      return;
    }

    if (!commentContent.trim()) {
      toast.error("请输入评论内容");
      return;
    }

    try {
      await postApi.addComment(id!, commentContent);
      setCommentContent("");
      toast.success("评论成功！");
      fetchPost();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("确定要删除这条评论吗？")) return;

    try {
      await postApi.deleteComment(id!, commentId);
      toast.success("评论已删除");
      fetchPost();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("确定要删除这篇文章吗？此操作不可恢复。")) return;

    try {
      await postApi.deletePost(id!);
      toast.success("文章已删除");
      navigate("/my-posts");
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!post) {
    return (
      <div className="container-custom py-16 text-center">
        <p className="text-gray-500">文章不存在</p>
      </div>
    );
  }

  const isAuthor = user?._id === post.author._id;

  return (
    <div className="container-custom py-8">
      <article className="max-w-4xl mx-auto">
        {/* 文章头部 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                to={`/profile/${post.author._id}`}
                className="flex items-center gap-2 hover:opacity-80"
              >
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                    {post.author.username[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {post.author.username}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(post.createdAt)}
                  </p>
                </div>
              </Link>

              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm">
                {post.category}
              </span>
            </div>

            {isAuthor && (
              <div className="flex gap-2">
                <Link
                  to={`/edit/${post._id}`}
                  className="btn btn-secondary text-sm"
                >
                  编辑
                </Link>
                <button
                  onClick={handleDeletePost}
                  className="btn bg-red-500 text-white hover:bg-red-600 text-sm"
                >
                  删除
                </button>
              </div>
            )}
          </div>

          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />
          )}
        </div>

        {/* 文章内容 */}
        <div className="prose prose-lg max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* 标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 点赞和统计 */}
        <div className="flex items-center gap-6 py-6 border-y border-gray-200 mb-8">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isLiked
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{likesCount}</span>
          </button>

          <div className="flex items-center gap-2 text-gray-600">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>{post.views} 次浏览</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{post.comments.length} 条评论</span>
          </div>
        </div>

        {/* 评论区 */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">评论 ({post.comments.length})</h2>

          {/* 发表评论 */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="space-y-4">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="input min-h-[100px]"
                placeholder="写下你的评论..."
              />
              <button type="submit" className="btn btn-primary">
                发表评论
              </button>
            </form>
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700"
              >
                登录后发表评论
              </Link>
            </div>
          )}

          {/* 评论列表 */}
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {comment.user.avatar ? (
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                        {comment.user.username[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {comment.user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(comment.createdAt)}
                      </p>
                    </div>
                  </div>

                  {user?._id === comment.user._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      删除
                    </button>
                  )}
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}

            {post.comments.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                暂无评论，来发表第一条评论吧！
              </p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
