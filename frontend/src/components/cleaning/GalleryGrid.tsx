"use client";

import React from "react";
import Image from "next/image";
import { GalleryImage } from "@/types";

interface GalleryGridProps {
  images: GalleryImage[];
  isAdmin: boolean;
  onDelete: (imageId: number) => void;
  onImageClick: (image: GalleryImage) => void;
  selectedImages?: number[];
  onToggleSelect?: (imageId: number) => void;
  selectionMode?: boolean;
}

export const GalleryGrid = React.memo(function GalleryGrid({
  images,
  isAdmin,
  onDelete,
  onImageClick,
  selectedImages = [],
  onToggleSelect,
  selectionMode = false,
}: GalleryGridProps) {
  if (images.length === 0) {
    return (
      <div className="col-span-full p-12 bg-gray-50 rounded-xl text-center">
        <p className="text-gray-500">
          아직 등록된 이미지가 없습니다.
          {isAdmin && " 위에서 이미지를 업로드해주세요."}
        </p>
      </div>
    );
  }

  const handleImageClick = (image: GalleryImage) => {
    if (selectionMode && onToggleSelect) {
      onToggleSelect(image.id);
    } else {
      onImageClick(image);
    }
  };

  return (
    <>
      {images.map((image, index) => {
        const isSelected = selectedImages.includes(image.id);
        // 첫 6개 이미지는 즉시 로드, 나머지는 lazy loading
        const shouldEagerLoad = index < 6;

        return (
          <div
            key={image.id}
            onClick={() => handleImageClick(image)}
            className={`group relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all ${
              isSelected ? "ring-4 ring-blue-500 scale-95" : ""
            }`}
          >
            <Image
              src={image.imageUrl}
              alt={image.description || "갤러리 이미지"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              loading={shouldEagerLoad ? "eager" : "lazy"}
              priority={index === 0}
            />

            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
              {isAdmin && !selectionMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(image.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-opacity"
                >
                  삭제
                </button>
              )}
            </div>

            {/* 선택 모드일 때 체크박스 */}
            {selectionMode && (
              <div className="absolute top-2 right-2">
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-300 group-hover:border-blue-400"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            )}

            {/* Before/After 라벨 */}
            <div className="absolute top-2 left-2">
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${
                  image.imageType === "BEFORE"
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {image.imageType}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
});
