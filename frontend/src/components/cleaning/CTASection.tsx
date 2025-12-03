"use client";

export function CTASection() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-center text-white">
        <h3 className="text-3xl font-bold mb-4">
          지금 바로 무료 견적 받아보세요
        </h3>
        <p className="text-blue-100 mb-6">
          전문가가 방문하여 정확한 견적을 제공해드립니다
        </p>
        <a
          href="/quote"
          className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors"
        >
          무료 견적 신청하기
        </a>
      </div>
    </div>
  );
}
