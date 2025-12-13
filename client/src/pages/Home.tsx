import { useState, useEffect } from "react";
import { postApi } from "@/services/api";
import { Post } from "@/types";
import PostCard from "@/components/PostCard";
import Loading from "@/components/Loading";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetchPosts();
  }, [page, category]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postApi.getPosts({
        page,
        limit: 9,
        category: category === "all" ? undefined : category,
      });
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setPosts([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      const data = await postApi.getPosts({
        search: searchTerm,
        page: 1,
      });
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 0);
      setPage(1);
    } catch (error) {
      console.error("Failed to search posts:", error);
      setPosts([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      {/* 搜索和筛选 */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="搜索文章..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input flex-1"
          />
          <button type="submit" className="btn btn-primary">
            搜索
          </button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {["all", "technology", "life", "travel", "food"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                category === cat
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {cat === "all"
                ? "全部"
                : cat === "technology"
                ? "技术"
                : cat === "life"
                ? "生活"
                : cat === "travel"
                ? "旅行"
                : "美食"}
            </button>
          ))}
        </div>
      </div>

      {/* 文章列表 */}
      {loading ? (
        <Loading />
      ) : posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-4 py-2 text-gray-700">
                第 {page} / {totalPages} 页
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">暂无文章</div>
      )}
    </div>
  );
}
