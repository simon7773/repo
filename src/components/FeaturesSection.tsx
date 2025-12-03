"use client";

import Image from "next/image";

const features = [
  {
    title: "서울 경기 인천",
    desc: "수도권을 커버하는 전문팀이 즉각 대응 드립니다.",
    image: "/image/지도.jpg",
  },
  {
    title: "수만건의 노하우",
    desc: "배테랑 팀이 현장을 책임집니다.\n직접 찾아가 확실하게 해결합니다.",
    image: "/image/청소메인2.jpg",
  },
  {
    title: "골든타임 사수!",
    desc: "시간은 돌려받을 수 없는 자산! \n집클릭으로 소중한 시간을 사수하세요.",
    image: "/image/골든타임.jpg",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 pb-80 px-4 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            왜 집클릭을 선택해야 할까요?
          </h2>
          <p className="text-xl text-gray-600">
            전문성과 신뢰를 바탕으로 한 최고의 서비스
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* 상단: 텍스트 영역 */}
              <div className="p-8 flex-grow bg-blue-500">
                <h3 className="text-2xl font-bold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-white leading-relaxed whitespace-pre-line">
                  {feature.desc}
                </p>
              </div>

              {/* 하단: 이미지 영역 */}
              <div className="relative w-full h-64 overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
