import { Link } from "react-router-dom";
import { Post } from "@/types";
import {
  formatRelativeTime,
  stripHtmlTags,
  truncateText,
} from "@/utils/helpers";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const excerpt =
    post.excerpt || truncateText(stripHtmlTags(post.content), 150);

  return (
    <article className="card hover:shadow-lg transition-shadow duration-200">
      {post.coverImage && (
        <Link to={`/posts/${post._id}`}>
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        </Link>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
          {post.category}
        </span>
        <span className="text-xs text-gray-500">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>

      <Link to={`/posts/${post._id}`}>
        <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
          {post.title}
        </h2>
      </Link>

      <p className="text-gray-600 mb-4 line-clamp-3">{excerpt}</p>

      <div className="flex items-center justify-between">
        <Link
          to={`/profile/${post.author._id}`}
          className="flex items-center gap-2 hover:opacity-80"
        >
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
              {post.author.username[0].toUpperCase()}
            </div>
          )}
          <span className="text-sm text-gray-700">{post.author.username}</span>
        </Link>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
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
            {post.views}
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
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
            {post.likes.length}
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
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
            {post.comments.length}
          </span>
        </div>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
