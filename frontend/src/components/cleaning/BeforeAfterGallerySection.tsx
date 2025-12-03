"use client";

import { UploadButton } from "./UploadButton";
import { GalleryGrid } from "./GalleryGrid";
import { GalleryImage } from "@/types";

interface BeforeAfterGallerySectionProps {
  isAdmin: boolean;
  beforeAfterView: "before" | "after";
  setBeforeAfterView: (view: "before" | "after") => void;
  images: GalleryImage[];
  uploading: boolean;
  uploadProgress: { current: number; total: number };
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (id: number) => Promise<void>;
  onImageClick: (image: GalleryImage) => void;
  selectedImages: number[];
  onToggleSelect: (imageId: number) => void;
  selectionMode: boolean;
  onToggleSelectionMode: () => void;
  onDeleteSelected: () => Promise<void>;
}

export function BeforeAfterGallerySection({
  isAdmin,
  beforeAfterView,
  setBeforeAfterView,
  images,
  uploading,
  uploadProgress,
  fileInputRef,
  handleFileChange,
  onDelete,
  onImageClick,
  selectedImages,
  onToggleSelect,
  selectionMode,
  onToggleSelectionMode,
  onDeleteSelected,
}: BeforeAfterGallerySectionProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-3xl font-bold text-gray-900">청소 전후 비교</h2>

          <div className="flex items-center gap-3 flex-wrap">
            {/* 관리자 업로드 버튼 */}
            {isAdmin && !selectionMode && (
              <UploadButton
                uploading={uploading}
                uploadProgress={uploadProgress}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
              />
            )}

            {/* 선택 모드 버튼 (관리자만) */}
            {isAdmin && (
              <button
                onClick={onToggleSelectionMode}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectionMode
                    ? "bg-gray-600 text-white hover:bg-gray-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {selectionMode ? "선택 취소" : "이미지 선택"}
              </button>
            )}

            {/* 선택된 항목 일괄 삭제 버튼 */}
            {isAdmin && selectionMode && selectedImages.length > 0 && (
              <button
                onClick={onDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                선택 삭제 ({selectedImages.length})
              </button>
            )}

            {/* Before/After 토글 */}
            {!selectionMode && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setBeforeAfterView("before")}
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    beforeAfterView === "before"
                      ? "bg-white text-blue-600 shadow"
                      : "text-gray-600"
                  }`}
                >
                  Before
                </button>
                <button
                  onClick={() => setBeforeAfterView("after")}
                  className={`px-6 py-2 rounded-md font-semibold transition-all ${
                    beforeAfterView === "after"
                      ? "bg-white text-green-600 shadow"
                      : "text-gray-600"
                  }`}
                >
                  After
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 선택 모드 안내 메시지 */}
        {selectionMode && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-blue-900">이미지 선택 모드</p>
                <p className="text-sm text-blue-700 mt-1">
                  삭제할 이미지를 클릭하여 선택하세요. 여러 개를 선택한 후 한번에 삭제할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 갤러리 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <GalleryGrid
            images={images}
            isAdmin={isAdmin}
            onDelete={onDelete}
            onImageClick={onImageClick}
            selectedImages={selectedImages}
            onToggleSelect={onToggleSelect}
            selectionMode={selectionMode}
          />
        </div>
      </div>
    </div>
  );
}
