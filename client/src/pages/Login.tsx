import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("请填写所有字段");
      return;
    }

    try {
      setLoading(true);
      const data = await authApi.login(email, password);
      login({ ...data, role: data.role as "user" | "admin" }, data.token);
      toast.success("登录成功！");
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 container-custom">
      <div className="max-w-md mx-auto">
        <div className="card">
          <h1 className="mb-8 text-3xl font-bold text-center">登录</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                邮箱
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                密码
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-gray-600">
            还没有账号？{" "}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              立即注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
