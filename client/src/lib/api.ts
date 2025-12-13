import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "请求失败，请稍后重试";

    // 401 未授权 - 清除登录状态
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      toast.error("登录已过期，请重新登录");
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
