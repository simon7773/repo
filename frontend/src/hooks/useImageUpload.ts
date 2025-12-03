import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface UseImageUploadProps {
  category: string;
  tab: string;
  imageType: "before" | "after";
  onSuccess?: () => void;
}

export function useImageUpload({ category, tab, imageType, onSuccess }: UseImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`${file.name}: 이미지 크기는 10MB 이하여야 합니다.`);
      }

      console.log(`[업로드 시작] ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);

      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: file.type,
        initialQuality: 0.85,
      };

      const compressedFile = await imageCompression(file, options);
      console.log(`[압축 완료] ${file.name} -> ${(compressedFile.size / 1024).toFixed(2)}KB`);

      const formData = new FormData();
      formData.append("image", compressedFile);
      formData.append("category", category);
      formData.append("tab", tab);
      formData.append("imageType", imageType === "before" ? "BEFORE" : "AFTER");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      const res = await fetch(`${API_URL}/api/gallery`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        let errorMessage = `${file.name}: 업로드에 실패했습니다 (${res.status})`;

        if (contentType?.includes("application/json")) {
          const data = await res.json();
          errorMessage = data.error || errorMessage;
        } else {
          const text = await res.text();
          console.error(`[서버 응답] ${text}`);
        }

        throw new Error(errorMessage);
      }

      console.log(`[업로드 성공] ${file.name}`);
      return res.json();
    } catch (error) {
      console.error(`[업로드 에러] ${file.name}:`, error);
      throw error;
    }
  };

  const uploadMultipleImages = async (files: FileList) => {
    const filesArray = Array.from(files);
    const totalFiles = filesArray.length;

    setUploading(true);
    setUploadProgress({ current: 0, total: totalFiles });

    const results = {
      success: [] as string[],
      failed: [] as string[],
    };

    let completedCount = 0;

    // 병렬 업로드로 변경 (Promise.allSettled 사용)
    const uploadPromises = filesArray.map(async (file) => {
      try {
        await uploadImage(file);
        results.success.push(file.name);
        completedCount++;
        setUploadProgress({ current: completedCount, total: totalFiles });
        return { status: 'fulfilled', file: file.name };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `${file.name}: 업로드 실패`;
        results.failed.push(errorMessage);
        completedCount++;
        setUploadProgress({ current: completedCount, total: totalFiles });
        return { status: 'rejected', file: file.name, error: errorMessage };
      }
    });

    await Promise.allSettled(uploadPromises);

    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // 결과 메시지 표시
    if (results.success.length > 0 && results.failed.length === 0) {
      alert(`${results.success.length}개의 이미지가 업로드되었습니다.`);
      onSuccess?.();
    } else if (results.success.length > 0 && results.failed.length > 0) {
      alert(
        `성공: ${results.success.length}개\n실패: ${results.failed.length}개\n\n실패한 파일:\n${results.failed.join("\n")}`
      );
      onSuccess?.();
    } else {
      alert(`모든 이미지 업로드에 실패했습니다.\n\n${results.failed.join("\n")}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    await uploadMultipleImages(e.target.files);
  };

  return { uploading, uploadProgress, fileInputRef, handleFileChange };
}
