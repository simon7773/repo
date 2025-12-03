"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Post, User } from "@/types";
import PostCard from "@/components/PostCard";
import Header from "@/components/Header";

export default function FeedPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error("Failed to parse user data", error);
      router.push("/login");
      return;
    }

    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const data = await fetchAPI("/api/posts");
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await fetchAPI(`/api/posts/${id}`, { method: "DELETE" });
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Failed to delete post", error);
      alert("삭제에 실패했습니다");
    }
  }, []);

  const handleLikeUpdate = useCallback((
    postId: number,
    liked: boolean,
    newCount: number
  ) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              _count: {
                likes: newCount,
                comments: post._count?.comments || 0,
              },
            }
          : post
      )
    );
  }, []);

  const renderedPosts = useMemo(() => {
    if (posts.length === 0) {
      return (
        <div className="text-center py-20">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            아직 게시글이 없습니다
          </h3>
          <p className="text-sm text-gray-500">
            첫 번째 리뷰를 작성해보세요!
          </p>
        </div>
      );
    }

    return posts.map((post) => (
      <PostCard
        key={post.id}
        post={post}
        onDelete={handleDelete}
        onLikeUpdate={handleLikeUpdate}
      />
    ));
  }, [posts, handleDelete, handleLikeUpdate]);

  if (!isClient || loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">로딩중...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20 pb-80">
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="mb-6">
            <a
              href="/posts/new"
              className="block w-full py-3 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              새 게시글 작성
            </a>
          </div>

          <div className="space-y-4">
            {renderedPosts}
          </div>
        </main>
      </div>
    </>
  );
}
