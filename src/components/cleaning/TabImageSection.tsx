"use client";

import Image from "next/image";
import { TabContent } from "@/constants/cleaning";

interface TabImageSectionProps {
  currentTab: TabContent;
  isAdmin: boolean;
  tabImageUrl: string | null;
  tabImageLoading: boolean;
  tabImageUploading: boolean;
  tabImageInputRef: React.RefObject<HTMLInputElement | null>;
  handleTabImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTabImageClick: () => void;
}

export function TabImageSection({
  currentTab,
  isAdmin,
  tabImageUrl,
  tabImageLoading,
  tabImageUploading,
  tabImageInputRef,
  handleTabImageChange,
  handleTabImageClick,
}: TabImageSectionProps) {
  return (
    <div className="p-8">
      <input
        ref={tabImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleTabImageChange}
        className="hidden"
        id="tab-image-upload"
      />
      <div
        className={`relative w-full h-[1000px] bg-gray-100 rounded-xl overflow-hidden ${
          isAdmin ? "cursor-pointer hover:bg-gray-200 transition-colors" : ""
        }`}
        onClick={handleTabImageClick}
      >
        {/* 이미지가 있으면 표시 */}
        {tabImageUrl && !tabImageUploading && (
          <Image
            src={tabImageUrl}
            alt={`${currentTab.label} 대표 이미지`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority={false}
            loading="lazy"
            unoptimized={false}
          />
        )}

        {/* 관리자 오버레이 */}
        {isAdmin && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all">
            <div className="text-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
              {tabImageUploading ? (
                <div className="bg-white rounded-lg p-6">
                  <svg
                    className="animate-spin mx-auto h-16 w-16 text-blue-600 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <p className="text-blue-600 font-medium">업로드 중...</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-6">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-600 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-600 font-medium mb-2">
                    {tabImageUrl ? "이미지 변경" : "이미지 업로드"}
                  </p>
                  <p className="text-sm text-gray-500">
                    클릭하여 {tabImageUrl ? "변경" : "업로드"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 이미지가 없고 관리자가 아닐 때 */}
        {!tabImageUrl && !isAdmin && !tabImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg">
                {currentTab.label} 서비스 이미지
              </p>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {tabImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
