"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useTabImageUpload } from "@/hooks/useTabImageUpload";
import { useTabImage } from "@/hooks/useTabImage";
import {
  TabNavigation,
  TabImageSection,
  BeforeAfterGallerySection,
  CTASection,
  ImageModal,
} from "@/components/cleaning";
import { CLEANING_TABS, TabType } from "@/constants/cleaning";
import { GalleryImage } from "@/types";

export default function HomeCleaningPage() {
  const [activeTab, setActiveTab] = useState<TabType>("room");
  const [beforeAfterView, setBeforeAfterView] = useState<"before" | "after">("before");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const isAdmin = useAdmin();
  const currentTabContent = CLEANING_TABS.find((tab) => tab.id === activeTab)!;

  const { images, fetchImages, deleteImage } = useGalleryImages({
    category: "HOME",
    tab: activeTab,
    imageType: beforeAfterView,
  });

  // Before/After 갤러리용 업로드
  const { uploading, uploadProgress, fileInputRef, handleFileChange } = useImageUpload({
    category: "HOME",
    tab: activeTab,
    imageType: beforeAfterView,
    onSuccess: fetchImages,
  });

  // 탭 대표 이미지 조회
  const { tabImageUrl, loading: tabImageLoading, refetchTabImage } = useTabImage({
    category: "HOME",
    tab: activeTab,
  });

  // 탭 대표 이미지용 업로드
  const {
    uploading: tabImageUploading,
    fileInputRef: tabImageInputRef,
    handleFileChange: handleTabImageChange
  } = useTabImageUpload({
    category: "HOME",
    tab: activeTab,
    onSuccess: () => {
      console.log("탭 대표 이미지 업로드 완료");
      refetchTabImage(); // 업로드 후 이미지 다시 불러오기
    },
  });

  // 탭 이미지 클릭 핸들러
  const handleTabImageClick = () => {
    if (isAdmin && tabImageInputRef.current) {
      tabImageInputRef.current.click();
    }
  };

  // 갤러리 이미지 클릭 핸들러
  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id);
    if (currentIndex < images.length - 1) {
      setSelectedImage(images[currentIndex + 1]);
    }
  };

  const handlePrevImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id);
    if (currentIndex > 0) {
      setSelectedImage(images[currentIndex - 1]);
    }
  };

  // 선택 모드 토글
  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedImages([]); // 모드 전환 시 선택 초기화
  };

  // 이미지 선택/해제
  const handleToggleSelect = (imageId: number) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  };

  // 선택된 이미지 일괄 삭제
  const handleDeleteSelected = async () => {
    if (selectedImages.length === 0) return;

    const confirmMessage = `선택한 ${selectedImages.length}개의 이미지를 삭제하시겠습니까?`;
    if (!confirm(confirmMessage)) return;

    try {
      // 모든 선택된 이미지 삭제 (skipConfirm: true로 개별 확인 건너뛰기)
      await Promise.all(selectedImages.map((id) => deleteImage(id, true)));

      // 삭제 완료 후 상태 초기화
      setSelectedImages([]);
      setSelectionMode(false);

      alert(`${selectedImages.length}개의 이미지가 삭제되었습니다.`);
    } catch (error) {
      console.error("일괄 삭제 중 오류 발생:", error);
      alert("이미지 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-80">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">가정 청소</h1>
          <p className="text-xl text-blue-100">
            전문가의 손길로 깨끗하고 쾌적한 우리 집을 만들어드립니다
          </p>
        </div>
      </div>

      {/* 탭 인터페이스 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* 탭 네비게이션 */}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          {/* 탭 대표 이미지 영역 */}
          <TabImageSection
            currentTab={currentTabContent}
            isAdmin={isAdmin}
            tabImageUrl={tabImageUrl}
            tabImageLoading={tabImageLoading}
            tabImageUploading={tabImageUploading}
            tabImageInputRef={tabImageInputRef}
            handleTabImageChange={handleTabImageChange}
            handleTabImageClick={handleTabImageClick}
          />
        </div>
      </div>

      {/* Before/After 갤러리 */}
      <BeforeAfterGallerySection
        isAdmin={isAdmin}
        beforeAfterView={beforeAfterView}
        setBeforeAfterView={setBeforeAfterView}
        images={images}
        uploading={uploading}
        uploadProgress={uploadProgress}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        onDelete={deleteImage}
        onImageClick={handleImageClick}
        selectedImages={selectedImages}
        onToggleSelect={handleToggleSelect}
        selectionMode={selectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* CTA 섹션 */}
      <CTASection />

      {/* 이미지 상세 모달 */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          images={images}
          isAdmin={isAdmin}
          onClose={handleCloseModal}
          onDelete={deleteImage}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
        />
      )}
    </div>
  );
}
