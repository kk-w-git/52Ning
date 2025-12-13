export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: "user" | "admin";
  postCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: User;
  tags: string[];
  category: string;
  published: boolean;
  views: number;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  token: string;
}

export interface PostsResponse {
  posts: Post[];
  currentPage: number;
  totalPages: number;
  total: number;
}
