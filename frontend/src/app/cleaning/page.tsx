"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

const categories = [
  {
    id: "home",
    title: "가정 청소",
    desc: "깨끗하고 쾌적한 우리집\n일상의 청결을 책임집니다.",
    image: "/image/kitchen.jpg",
    features: ["거실/방 청소", "주방 청소", "화장실 청소", "베란다 청소"],
  },
  {
    id: "office",
    title: "사무실 청소",
    desc: "쾌적한 업무환경 조성\n생산성을 높이는 깨끗한 공간.",
    image: "/image/office.jpg",
    features: ["사무공간 청소", "회의실 청소", "공용공간 청소", "정기 청소"],
  },
  {
    id: "move",
    title: "이사 청소",
    desc: "새 출발을 위한 완벽한 준비\n입주 전/후 청소 전문.",
    image: "/image/moving.jpg",
    features: ["입주 청소", "이사 후 청소", "곰팡이 제거", "바닥 왁스"],
  },
  {
    id: "special",
    title: "특수 청소",
    desc: "전문 장비와 기술로\n일반 청소로는 힘든 곳까지.",
    image: "/image/특수청소.jpg",
    features: ["쓰레기집", "사무실", "고독사", "소독/방역"],
  },
];

export default function CleaningPage() {
  const router = useRouter();

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === "home") {
      router.push("/cleaning/home");
    } else {
      router.push(`/services?category=${categoryId.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-80">
      {/* 페이지 헤더 */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">청소 서비스</h1>
          <p className="text-xl text-blue-100">
            전문적인 청소 서비스로 깨끗한 공간을 만들어 드립니다
          </p>
        </div>
      </div>

      {/* 카테고리 그리드 */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
            >
              {/* 이미지 영역 */}
              <div className="relative w-full h-64 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <h2 className="absolute bottom-4 left-6 text-3xl font-bold text-white">
                  {category.title}
                </h2>
              </div>

              {/* 텍스트 영역 */}
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-4">
                  {category.desc}
                </p>

                {/* 서비스 특징 태그 */}
                <div className="flex flex-wrap gap-2">
                  {category.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* 더보기 버튼 */}
                <div className="mt-6 flex justify-end">
                  <span className="text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-1">
                    자세히 보기
                    <svg
                      className="w-5 h-5"
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
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 CTA */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            어떤 청소가 필요하신가요?
          </h3>
          <p className="text-gray-600 mb-8">
            무료 상담을 통해 맞춤 견적을 받아보세요
          </p>
          <button
            onClick={() => router.push("/quote")}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full hover:bg-blue-700 transition-colors"
          >
            무료 견적 받기
          </button>
        </div>
      </div>
    </div>
  );
}
