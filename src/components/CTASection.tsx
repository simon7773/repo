"use client";

import { useRouter } from "next/navigation";

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-green-200 to-green-400 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-yellow-200 opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-64 h-64 bg-orange-300 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full opacity-10 animate-pulse animation-delay-2000"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          지금 바로 시작하세요
        </h2>
        <p className="text-xl text-white/90 mb-8">
          깨끗하고 쾌적한 환경, 집클린이 함께합니다
        </p>
        <button
          onClick={() => router.push("/quote")}
          className="px-10 py-4 bg-white text-blue-600 text-lg font-bold rounded-full hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          무료 견적
        </button>
      </div>
    </section>
  );
}
