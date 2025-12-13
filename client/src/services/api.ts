import api from "@/lib/api";
import { AuthResponse } from "@/types";

export const authApi = {
  register: async (username: string, email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      username,
      email,
      password,
    });
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};

export const postApi = {
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    author?: string;
  }) => {
    const { data } = await api.get("/posts", { params });
    return data;
  },

  getPost: async (id: string) => {
    const { data } = await api.get(`/posts/${id}`);
    return data;
  },

  createPost: async (postData: {
    title: string;
    content: string;
    excerpt?: string;
    coverImage?: string;
    tags?: string[];
    category?: string;
  }) => {
    const { data } = await api.post("/posts", postData);
    return data;
  },

  updatePost: async (
    id: string,
    postData: Partial<{
      title: string;
      content: string;
      excerpt: string;
      coverImage: string;
      tags: string[];
      category: string;
      published: boolean;
    }>
  ) => {
    const { data } = await api.put(`/posts/${id}`, postData);
    return data;
  },

  deletePost: async (id: string) => {
    const { data } = await api.delete(`/posts/${id}`);
    return data;
  },

  likePost: async (id: string) => {
    const { data } = await api.post(`/posts/${id}/like`);
    return data;
  },

  addComment: async (id: string, content: string) => {
    const { data } = await api.post(`/posts/${id}/comments`, { content });
    return data;
  },

  deleteComment: async (postId: string, commentId: string) => {
    const { data } = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return data;
  },
};

export const userApi = {
  getUser: async (id: string) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  updateProfile: async (profileData: {
    username?: string;
    bio?: string;
    avatar?: string;
  }) => {
    const { data } = await api.put("/users/profile", profileData);
    return data;
  },

  getUserPosts: async (
    id: string,
    params?: { page?: number; limit?: number }
  ) => {
    const { data } = await api.get(`/users/${id}/posts`, { params });
    return data;
  },
};

export const uploadApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    const { data } = await api.post("/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};
