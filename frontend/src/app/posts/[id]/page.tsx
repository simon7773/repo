/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Post, Comment } from "@/types";

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: number }>({ id: 0 });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(userData);
    fetchPost();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      const data = await fetchAPI(`/api/posts/${params.id}`);
      console.log(data);
      setPost(data);
      setLiked(data.likes.some((like: any) => like.userId === currentUser.id));
    } catch (error) {
      console.error("Failed to fetch post", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    // 이전 상태 저장 (에러 발생 시 복구용)
    const previousLiked = liked;
    const previousPost = { ...post };

    // 1. 낙관적 업데이트 - 즉시 UI 업데이트
    const optimisticLiked = !liked;

    setLiked(optimisticLiked);
    setPost({
      ...post,
      likes: optimisticLiked
        ? [...post.likes, { userId: currentUser.id }]
        : post.likes.filter((like: any) => like.userId !== currentUser.id),
    });

    try {
      // 2. 서버에 요청
      const data = await fetchAPI("/api/likes/toggle", {
        method: "POST",
        body: JSON.stringify({ postId: post.id }),
      });

      // 3. 서버 응답으로 최종 동기화
      setLiked(data.liked);
      fetchPost(); // 서버에서 최신 데이터 가져오기
    } catch (error) {
      // 4. 실패 시 원래 상태로 복구
      setLiked(previousLiked);
      setPost(previousPost);
      console.error("Failed to toggle like", error);
      alert("좋아요 처리에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await fetchAPI("/api/comments", {
        method: "POST",
        body: JSON.stringify({
          content: comment,
          postId: post?.id,
        }),
      });
      setComment("");
      fetchPost();
    } catch (error) {
      alert("댓글 작성에 실패했습니다");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      await fetchAPI(`/api/comments/${commentId}`, { method: "DELETE" });
      fetchPost();
    } catch (error) {
      alert("댓글 삭제에 실패했습니다");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩중...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>게시글을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4"></div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-80">
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              {post.user.avatar ? (
                <img
                  src={post.user.avatar}
                  alt={post.user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-medium">
                  {post.user.username[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium">{post.user.username}</p>
              <p className="text-sm text-gray-500">
                {new Date(post.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>

          <p className="mb-4">{post.content}</p>

          {post.image && (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${post.image}`}
              alt="Post"
              className="w-full rounded-lg mb-4"
            />
          )}

          <div className="flex items-center gap-4 border-t pt-4">
            <button
              onClick={handleLike}
              className={`hover:text-blue-500 ${
                liked ? "text-blue-500" : "text-gray-500"
              }`}
            >
              {liked ? "♥" : "♡"} {post.likes.length}
            </button>
            <span className="text-gray-500">댓글 {post.comments.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold mb-4">댓글</h2>

          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              rows={3}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              댓글 작성
            </button>
          </form>

          <div className="space-y-4">
            {post.comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                아직 댓글이 없습니다
              </p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {comment.user.username[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {comment.user.username}
                        </p>
                        <p className="text-gray-700 mt-1">{comment.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </p>
                      </div>
                    </div>
                    {comment.userId === currentUser.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
