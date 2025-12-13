import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("已退出登录");
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-bold text-primary-600 hover:text-primary-700"
          >
            我的博客
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              首页
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/create"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  写文章
                </Link>
                <Link
                  to="/my-posts"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  我的文章
                </Link>
                <div className="flex items-center gap-4">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 hover:opacity-80"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                        {user?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-gray-700">{user?.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    退出
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  登录
                </Link>
                <Link to="/register" className="btn btn-primary">
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
