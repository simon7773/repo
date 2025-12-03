import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface UseTabImageProps {
  category: string;
  tab: string;
}

export function useTabImage({ category, tab }: UseTabImageProps) {
  const [tabImageUrl, setTabImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTabImage = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/gallery?category=${category}&tab=${tab}&imageType=TAB`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch tab image");
      }

      const images = await res.json();

      // TAB 타입 이미지가 있으면 첫 번째 이미지 사용
      if (images && images.length > 0) {
        setTabImageUrl(images[0].imageUrl);
      } else {
        setTabImageUrl(null);
      }
    } catch (error) {
      console.error("Error fetching tab image:", error);
      setTabImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabImage();
  }, [category, tab]);

  return { tabImageUrl, loading, refetchTabImage: fetchTabImage };
}
