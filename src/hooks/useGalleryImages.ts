import { useState, useEffect, useCallback } from "react";
import { GalleryImage, ImageType } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface UseGalleryImagesProps {
  category: string;
  tab: string;
  imageType: "before" | "after";
}

export function useGalleryImages({ category, tab, imageType }: UseGalleryImagesProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const type: ImageType = imageType === "before" ? "BEFORE" : "AFTER";
      const res = await fetch(
        `${API_URL}/api/gallery?category=${category}&tab=${tab}&imageType=${type}`
      );
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error("갤러리 이미지 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [category, tab, imageType]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const deleteImage = async (imageId: number, skipConfirm: boolean = false) => {
    if (!skipConfirm && !confirm("이미지를 삭제하시겠습니까?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/gallery/${imageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        if (!skipConfirm) {
          alert("이미지가 삭제되었습니다.");
        }
        fetchImages();
      } else {
        throw new Error("이미지 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("삭제 실패:", error);
      if (!skipConfirm) {
        alert("이미지 삭제에 실패했습니다.");
      }
      throw error;
    }
  };

  return { images, loading, fetchImages, deleteImage };
}
