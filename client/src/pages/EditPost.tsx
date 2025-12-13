import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { postApi, uploadApi } from "@/services/api";
import { Post } from "@/types";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("technology");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const post: Post = await postApi.getPost(id!);
      setTitle(post.title);
      setContent(post.content);
      setExcerpt(post.excerpt || "");
      setCategory(post.category);
      setTags(post.tags.join(", "));
      setCoverImage(post.coverImage || "");
    } catch (error) {
      console.error("Failed to fetch post:", error);
      toast.error("文章不存在");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    try {
      setUploading(true);
      const data = await uploadApi.uploadImage(file);
      setCoverImage(data.url);
      toast.success("图片上传成功！");
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("标题和内容不能为空");
      return;
    }

    try {
      setSubmitting(true);
      const postData = {
        title,
        content,
        excerpt: excerpt || undefined,
        coverImage: coverImage || undefined,
        category,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      await postApi.updatePost(id!, postData);
      toast.success("文章更新成功！");
      navigate(`/posts/${id}`);
    } catch (error) {
      console.error("Failed to update post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image"],
      ["clean"],
    ],
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">编辑文章</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              标题 *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="请输入文章标题"
              required
            />
          </div>

          <div>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              摘要
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="input min-h-[80px]"
              placeholder="简短描述文章内容（可选）"
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">{excerpt.length}/300</p>
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              分类
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              <option value="technology">技术</option>
              <option value="life">生活</option>
              <option value="travel">旅行</option>
              <option value="food">美食</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              标签
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input"
              placeholder="使用逗号分隔，例如：JavaScript, React, Node.js"
            />
          </div>

          <div>
            <label
              htmlFor="coverImage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              封面图片
            </label>
            <input
              type="file"
              id="coverImage"
              accept="image/*"
              onChange={handleImageUpload}
              className="input"
              disabled={uploading}
            />
            {uploading && (
              <p className="text-sm text-gray-500 mt-1">上传中...</p>
            )}
            {coverImage && (
              <div className="mt-2">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="max-w-xs rounded-lg"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              内容 *
            </label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              className="bg-white"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="btn btn-primary"
            >
              {submitting ? "保存中..." : "保存更改"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/posts/${id}`)}
              className="btn btn-secondary"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
