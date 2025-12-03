"use client";

import { useEffect } from "react";
import Image from "next/image";
import { GalleryImage } from "@/types";

interface ImageModalProps {
  image: GalleryImage;
  images: GalleryImage[];
  isAdmin: boolean;
  onClose: () => void;
  onDelete: (imageId: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ImageModal({
  image,
  images,
  isAdmin,
  onClose,
  onDelete,
  onNext,
  onPrev,
}: ImageModalProps) {
  const currentIndex = images.findIndex((img) => img.id === image.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  // 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleDelete = () => {
    if (confirm("이미지를 삭제하시겠습니까?")) {
      onDelete(image.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      {/* 모달 컨텐츠 */}
      <div
        className="relative max-w-7xl max-h-[90vh] w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 이전 버튼 */}
        {hasPrev && (
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* 다음 버튼 */}
        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* 이미지 */}
        <div className="relative w-full h-[80vh] flex items-center justify-center">
          <Image
            src={image.imageUrl}
            alt={image.description || "갤러리 이미지"}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* 하단 정보 */}
        <div className="absolute bottom-0 left-0 right-0 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded text-sm font-bold ${
                  image.imageType === "BEFORE"
                    ? "bg-red-500"
                    : "bg-green-500"
                }`}
              >
                {image.imageType}
              </span>
              <span className="text-sm text-gray-300">
                {currentIndex + 1} / {images.length}
              </span>
              {image.description && (
                <span className="text-sm">{image.description}</span>
              )}
            </div>

            {isAdmin && (
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
