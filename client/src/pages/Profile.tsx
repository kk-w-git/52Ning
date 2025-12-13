import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { userApi, uploadApi } from "@/services/api";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    try {
      setUploading(true);
      const data = await uploadApi.uploadImage(file);
      setAvatar(data.url);
      toast.success("头像上传成功！");
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("用户名不能为空");
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await userApi.updateProfile({
        username,
        bio,
        avatar,
      });
      updateUser(updatedUser);
      toast.success("资料更新成功！");
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">个人资料</h1>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6">
              <div>
                {avatar ? (
                  <img
                    src={avatar}
                    alt={username}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-medium">
                    {username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="avatar"
                  className="btn btn-secondary cursor-pointer"
                >
                  {uploading ? "上传中..." : "更换头像"}
                </label>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  支持 JPG、PNG、GIF 格式，最大 5MB
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                用户名 *
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                邮箱
              </label>
              <input
                type="email"
                id="email"
                value={user?.email || ""}
                className="input bg-gray-100"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">邮箱不可修改</p>
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                个人简介
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input min-h-[100px]"
                placeholder="介绍一下自己..."
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{bio.length}/200</p>
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="btn btn-primary"
            >
              {loading ? "保存中..." : "保存更改"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
