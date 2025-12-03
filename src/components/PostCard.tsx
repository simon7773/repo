/* eslint-disable @next/next/no-img-element */
"use client";

import { Post } from "@/types";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { fetchAPI } from "@/lib/api";

interface PostCardProps {
  post: Post;
  onDelete?: (id: number) => void;
  onLikeUpdate?: (postId: number, liked: boolean, newCount: number) => void;
}

const PostCard = memo(function PostCard({ post, onDelete, onLikeUpdate }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);

  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const isOwner = useMemo(() => currentUser.id === post.userId, [currentUser.id, post.userId]);

  // 초기 좋아요 상태 및 카운트 설정
  useEffect(() => {
    if (post.likes && currentUser.id) {
      const isLiked = post.likes.some((like) => like.userId === currentUser.id);
      setLiked(isLiked);
    }
    // 서버에서 받은 카운트로 동기화
    setLikesCount(post._count?.likes || 0);
  }, [post.likes, post._count?.likes, currentUser.id]);

  const formattedDate = useMemo(() => {
    return new Date(post.createdAt).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [post.createdAt]);

  const handleLike = useCallback(async () => {
    try {
      // 1. 서버에 요청 (낙관적 업데이트 제거)
      const data = await fetchAPI("/api/likes/toggle", {
        method: "POST",
        body: JSON.stringify({ postId: post.id }),
      });

      // 2. 서버 응답으로 상태 업데이트 (서버 응답을 신뢰)
      if (data && typeof data.liked === "boolean" && typeof data.count === "number") {
        setLiked(data.liked);
        setLikesCount(data.count);

        // 3. 부모 컴포넌트에 알림
        if (onLikeUpdate) {
          onLikeUpdate(post.id, data.liked, data.count);
        }
      } else {
        console.error("잘못된 서버 응답:", data);
      }
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
    }
  }, [post.id, onLikeUpdate]);

  const handleMenuToggle = useCallback(() => {
    setShowMenu((prev) => !prev);
  }, []);

  const handleDeleteClick = useCallback(() => {
    if (onDelete) {
      onDelete(post.id);
    }
  }, [onDelete, post.id]);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            {post.user.avatar ? (
              <img
                src={post.user.avatar}
                alt={post.user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-medium">
                {post.user.username[0].toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium">{post.user.username}</p>
            <p className="text-xs text-gray-500">
              {formattedDate}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button
              onClick={handleMenuToggle}
              className="text-gray-500 hover:text-gray-700"
            >
              •••
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border z-10">
                <button
                  onClick={handleDeleteClick}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 rounded-lg"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mb-3">{post.content}</p>

      {post.image && (
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}${post.image}`}
          alt="Post"
          className="w-full rounded-lg mb-3"
        />
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            liked
              ? "bg-red-50 text-red-500 hover:bg-red-100"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <span className="text-lg">❤️</span>
          <span>좋아요 {likesCount}</span>
        </button>
        <a
          href={`/posts/${post.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all"
        >
          <span className="text-lg">💬</span>
          <span>댓글 {post._count?.comments || 0}</span>
        </a>
      </div>
    </div>
  );
});

export default PostCard;
