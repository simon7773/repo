import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface UseTabImageUploadProps {
  category: string;
  tab: string;
  onSuccess?: () => void;
}

export function useTabImageUpload({ category, tab, onSuccess }: UseTabImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadTabImage = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("이미지 크기는 5MB 이하여야 합니다.");
    }

    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type,
    };

    const compressedFile = await imageCompression(file, options);

    const formData = new FormData();
    formData.append("image", compressedFile);
    formData.append("category", category);
    formData.append("tab", tab);
    formData.append("imageType", "TAB"); // 탭 대표 이미지는 TAB 타입으로 고정

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/gallery`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "업로드에 실패했습니다.");
    }

    return res.json();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0]; // 단일 파일만 처리
    setUploading(true);

    try {
      await uploadTabImage(file);
      alert("탭 대표 이미지가 업로드되었습니다.");
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "업로드 실패";
      alert(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return { uploading, fileInputRef, handleFileChange };
}
